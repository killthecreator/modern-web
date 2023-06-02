import { useCallback, useEffect, useRef, useState } from "react";
import type { useInfiniteQuery } from "@tanstack/react-query";
import {
  elementScroll,
  useVirtualizer,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { ChevronUp } from "lucide-react";

import { LoadingPage } from "./loading";
import PostView from "./postWithUser";
import { Button } from "./ui";

import type { PostsWithUser } from "~/types";
import { api } from "~/utils/api";

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

type UseTRPCInfiniteQueryResult = ReturnType<
  typeof useInfiniteQuery<PostsWithUser>
>;

const List = ({
  data,
}: {
  data: {
    curLoadedPosts: PostsWithUser["postsWithUserdata"];
    onRefChange: (node: HTMLDivElement) => void;
    hasNextPage: boolean | undefined;
    isRefetching: boolean;
  };
}) => {
  const { curLoadedPosts, onRefChange, hasNextPage, isRefetching } = data;
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<number>();

  const scrollToFn: VirtualizerOptions<
    HTMLDivElement,
    HTMLLIElement
  >["scrollToFn"] = useCallback((offset, canSmooth, instance) => {
    if (parentRef.current) {
      const duration = 1000;
      const start = parentRef.current.scrollTop;
      const startTime = (scrollingRef.current = Date.now());

      const run = () => {
        if (scrollingRef.current !== startTime) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (offset - start) * progress;

        if (elapsed < duration) {
          elementScroll(interpolated, canSmooth, instance);
          requestAnimationFrame(run);
        } else {
          elementScroll(interpolated, canSmooth, instance);
        }
      };

      requestAnimationFrame(run);
    }
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: curLoadedPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (window.innerWidth >= 640 ? 88 : 68),
    scrollToFn,
  });

  useEffect(() => {
    if (isRefetching) {
      rowVirtualizer.scrollToIndex(0);
    }
  }, [isRefetching, rowVirtualizer]);

  return (
    <div ref={parentRef} className="scrollbar-hide h-full overflow-auto">
      <ul className={`relative w-full h-[${rowVirtualizer.getTotalSize()}px] `}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <li
            key={curLoadedPosts[virtualItem.index]!.post.id}
            className={`absolute left-0 top-0 w-full h-[${virtualItem.size}px]`}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {virtualItem.index !== curLoadedPosts.length - 1 || !hasNextPage ? (
              <PostView {...curLoadedPosts[virtualItem.index]!} />
            ) : (
              <div className="h-[68px] w-full sm:h-[88px]" ref={onRefChange}>
                <LoadingPage />
              </div>
            )}
          </li>
        ))}
      </ul>
      <Button
        onClick={() => rowVirtualizer.scrollToIndex(0)}
        className="fixed bottom-4 right-3 rounded-full p-2"
      >
        <ChevronUp />
      </Button>
    </div>
  );
};

const PostsList = ({
  data,
  isLoading,
  hasNextPage,
  fetchNextPage,
  refetch,
  isRefetching,
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
      <List data={{ curLoadedPosts, onRefChange, hasNextPage, isRefetching }} />
    </div>
  );
};
export default PostsList;
