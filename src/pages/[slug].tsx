import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postWithUser";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { useRef, useEffect, useCallback } from "react";
import { useIntersectionObserver } from "~/utils/hooks";

const ProfilePosts = ({ userId }: { userId: string }) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.posts.getPostsByUserId.useInfiniteQuery(
      { userId },
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
      <ul className="mt-[280px] h-min">
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
  );
};

const profilePicSize = 128;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery(
    {
      username,
    },
    {
      refetchInterval: 5000,
    }
  );

  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="fixed z-10 w-full bg-white/95  shadow-md md:max-w-2xl">
          <div className="relative h-36 bg-slate-600">
            <Image
              className="absolute bottom-0 left-0 ml-4 translate-y-1/2 rounded-full border-2 border-black"
              src={data.profileImageUrl}
              height={profilePicSize}
              width={profilePicSize}
              alt="profile-pic"
            />
          </div>
          <div className="h-[64px]"></div>

          <div className="p-4 text-2xl font-bold text-slate-950">{`@${
            data.username ?? ""
          }`}</div>
          <div className="w-full"></div>
        </div>

        <ProfilePosts userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("no slug");
  }

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
