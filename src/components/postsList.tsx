import { type RouterOutputs } from "~/utils/api";
import PostView from "./postWithUser";
import { cn } from "~/lib/utils";
import { LoadingPage } from "./loading";

import List from "rc-virtual-list";
import { useEffect, useCallback, useState } from "react";
import type {
  InfiniteData,
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";

type PostsWithUser = RouterOutputs["posts"]["getAll"];

interface PostsListProps {
  data: InfiniteData<PostsWithUser> | undefined;
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<PostsWithUser>>;
}

const PostsList = ({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PostsListProps) => {
  const loadMorePosts = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  const [domNode, setDomNode] = useState<HTMLDivElement>();
  const onRefChange = useCallback((node: HTMLDivElement) => {
    setDomNode(node);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting && hasNextPage && !isLoading) {
        void loadMorePosts();
      }
    });
    if (domNode) {
      observer.observe(domNode);
    }
    return () => {
      observer.disconnect();
    };
  }, [isLoading, hasNextPage, loadMorePosts, domNode, isFetchingNextPage]);

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
              {index === 0 && <div className="h-[200px] w-full"></div>}
              <>
                <PostView key={fullPost.post.id} {...fullPost} />
                {index === curLoadedPosts.length - 1 && (
                  <>
                    <div
                      className="absolute bottom-0 h-1 w-full"
                      ref={onRefChange}
                    ></div>
                    {isFetchingNextPage && (
                      <div className="my-10">
                        <LoadingPage />
                      </div>
                    )}
                  </>
                )}
              </>
            </>
          );
        }}
      </List>
    </>
  );
};
export default PostsList;
