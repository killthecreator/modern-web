import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingPage } from "~/components/loading";
import { useRef, useEffect, useCallback } from "react";
import PostsList from "~/components/postsList";

const SearchPage: NextPage<{ content: string }> = ({ content }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.search.getPostsByContent.useInfiniteQuery(
      { content },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const loadTrigger = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting && hasNextPage && !isLoading) {
        void loadMorePosts();
      }
    });
    if (loadTrigger.current) {
      observer.observe(loadTrigger.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [isLoading, hasNextPage, loadMorePosts]);

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
        <PostsList
          postsWithUser={curLoadedPosts}
          isFetchingNextPage={isFetchingNextPage}
          ref={loadTrigger}
        />
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
