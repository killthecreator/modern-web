import type { GetStaticProps, GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";

import PostView from "~/components/postWithUser";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { Separator } from "~/components/ui";
import { LoadingPage } from "~/components/loading";

const SearchPage: NextPage<{ content: string }> = ({ content }) => {
  const { data, isLoading } = api.search.getPostsByContent.useQuery(
    {
      content,
    },
    {
      refetchInterval: 5000,
    }
  );

  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>No posts with such content</div>;

  return (
    <>
      <Head>
        <title>{content}</title>
      </Head>
      <PageLayout>
        <ul>
          {data.map((fullPost, index) => (
            <li key={fullPost.post.id}>
              <PostView {...fullPost} />
              {index !== data.length - 1 && <Separator />}
            </li>
          ))}
        </ul>
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

/* export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}; */

export default SearchPage;
