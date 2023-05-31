import { type CSSProperties, useCallback, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import type { useInfiniteQuery } from "@tanstack/react-query";

import { LoadingPage } from "./loading";
import PostView from "./postWithUser";
import { Button } from "./ui";

import type { PostsWithUser } from "~/types";
import { api } from "~/utils/api";

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
        <div className="h-[68px] w-full sm:h-[88px]" ref={onRefChange}>
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
  refetch,
}: UseTRPCInfiniteQueryResult) => {
  const loadMorePosts = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  const { data: a } = api.posts.getNumberOfNewPosts.useQuery(undefined, {
    refetchInterval: 30 * 1000,
  });

  const [newPosts, setNewPosts] = useState({ data: 0, triggered: false });

  useEffect(() => {
    if (a && !newPosts.triggered) {
      setNewPosts({ data: a, triggered: true });
    }
  }, [a, setNewPosts, newPosts]);

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
    <div className="relative h-full border-x-2">
      {a && a !== newPosts.data && newPosts.data !== 0 && (
        <Button
          variant="secondary"
          className="absolute z-10 flex h-16 w-full cursor-pointer items-center justify-center rounded-b-md border-y bg-white/50 text-xl shadow-md"
          onClick={async () => {
            setNewPosts({ data: 0, triggered: false });
            await refetch();
          }}
        >
          {`${a - newPosts.data} new post${a - newPosts.data === 1 ? "" : "s"}`}
        </Button>
      )}
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            className="scrollbar-hide"
            height={height}
            itemData={{ curLoadedPosts, onRefChange, hasNextPage }}
            itemCount={curLoadedPosts.length}
            itemSize={window.innerWidth >= 640 ? 88 : 68}
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
