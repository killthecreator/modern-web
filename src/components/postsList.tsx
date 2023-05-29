import PostView from "./postWithUser";
import { cn } from "~/lib/utils";
import { LoadingPage } from "./loading";
import type { PostsWithUser } from "~/types";

import List from "rc-virtual-list";
import { useEffect, useCallback, useState, useRef } from "react";
import type { useInfiniteQuery } from "@tanstack/react-query";

type UseTRPCInfiniteQueryResult = ReturnType<
  typeof useInfiniteQuery<PostsWithUser>
>;

const PostsList = ({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseTRPCInfiniteQueryResult) => {
  const loadMorePosts = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  const [domNode, setDomNode] = useState<HTMLDivElement>();
  const onRefChange = useCallback((node: HTMLDivElement) => {
    setDomNode(node);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting && hasNextPage) {
        void loadMorePosts();
      }
    });
    if (domNode) {
      observer.observe(domNode);
    }
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, loadMorePosts, domNode]);

  if (isLoading) return <LoadingPage />;
  if (!data) return <p>Opps... Something went wrong</p>;

  const curLoadedPosts = [
    ...data.pages.map((page) => page.postsWithUserdata),
  ].flat();

  return (
    <>
      <List
        className="relative [&>*]:overflow-hidden [&>.rc-virtual-list-scrollbar]:hidden "
        height={window.innerHeight}
        itemHeight={88}
        data={curLoadedPosts}
        itemKey="id"
      >
        {(fullPost, index) => {
          return (
            <>
              {index === 0 && <div className="h-[200px]"></div>}
              <PostView key={fullPost.post.id} {...fullPost} />
              {index === curLoadedPosts.length - 1 && (
                <>
                  <div className="h-16 w-full" ref={onRefChange}>
                    {hasNextPage && isFetchingNextPage && <LoadingPage />}
                  </div>
                </>
              )}
            </>
          );
        }}
      </List>
    </>
  );
};
export default PostsList;
