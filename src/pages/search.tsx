import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";

import PostView from "~/components/postWithUser";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingPage } from "~/components/loading";
import { useRef, useEffect, useCallback } from "react";
import { useIntersectionObserver } from "~/utils/hooks";

const SearchPage: NextPage<{ content: string }> = ({ content }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.search.getPostsByContent.useInfiniteQuery(
      { content },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const loadTrigger = useRef<HTMLUListElement>(null);
  const entry = useIntersectionObserver(loadTrigger, {
    threshold: 1,
  });
  const isVisible = !!entry?.isIntersecting;

  const loadMorePosts = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    if (isVisible && hasNextPage) {
      void loadMorePosts();
    }
  }, [isVisible, loadMorePosts, hasNextPage]);

  if (isLoading) return <LoadingPage />;
  if (!data) return <p>Opps... Something went wrong</p>;

  const curLoadedPosts = [
    ...data.pages.map((page) => page.postsWithUserdata),
  ].flat();

  return (
    <>
      <Head>
        <title>{content}</title>
      </Head>
      <PageLayout>
        <>
          <ul className="h-min">
            {curLoadedPosts.map((fullPost) => (
              <li key={fullPost.post.id}>
                <PostView {...fullPost} />
              </li>
            ))}
          </ul>
          <span className="h-1 w-full " ref={loadTrigger}></span>
          {isFetchingNextPage && (
            <div className="my-10">
              <LoadingPage />
            </div>
          )}
        </>
      </PageLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssg = generateSSGHelper();

  const content = context.query.result;

  if (typeof content !== "string") {
    throw new Error("no content");
  }

  await ssg.search.getPostsByContent.prefetch({ content });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      content,
    },
  };
};

export default SearchPage;
