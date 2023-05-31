import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { PageLayout } from "~/components/layout";
import PostsList from "~/components/postsList";
import { useGetPostsBySearch } from "~/hooks";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const SearchPage: NextPage<{ content: string }> = ({ content }) => {
  const queryResult = useGetPostsBySearch(content);

  return (
    <>
      <Head>
        <title>{content}</title>
      </Head>
      <PageLayout>
        <PostsList {...queryResult} />
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
