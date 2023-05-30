import PostView from "./postWithUser";
import { LoadingPage } from "./loading";
import type { PostsWithUser } from "~/types";

import { FixedSizeList as List } from "react-window";
import { useEffect, useCallback, useState } from "react";
import type { useInfiniteQuery } from "@tanstack/react-query";
import AutoSizer from "react-virtualized-auto-sizer";
import type { CSSProperties } from "react";

type UseTRPCInfiniteQueryResult = ReturnType<
  typeof useInfiniteQuery<PostsWithUser>
>;

const Row = ({
  data,
  index,
  style,
}: {
  data: {
    curLoadedPosts: PostsWithUser["postsWithUserdata"];
    onRefChange: (node: HTMLDivElement) => void;
    hasNextPage: boolean | undefined;
  };
  index: number;
  style: CSSProperties | undefined;
}) => {
  const { curLoadedPosts, onRefChange, hasNextPage } = data;

  return (
    <div style={style}>
      {index !== curLoadedPosts.length - 1 || !hasNextPage ? (
        <PostView
          key={curLoadedPosts[index]!.post.id}
          {...curLoadedPosts[index]!}
        />
      ) : (
        <div className="h-[88px] w-full" ref={onRefChange}>
          <LoadingPage />
        </div>
      )}
    </div>
  );
};
const PostsList = ({
  data,
  isLoading,
  hasNextPage,
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
    <div className="h-full border-x-2">
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            className="scrollbar-hide"
            height={height}
            itemData={{ curLoadedPosts, onRefChange, hasNextPage }}
            itemCount={curLoadedPosts.length}
            itemSize={88}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};
export default PostsList;
