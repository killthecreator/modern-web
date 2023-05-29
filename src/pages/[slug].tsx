import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import PostsList from "~/components/postsList";
import { useGetPostsByUser } from "~/hooks";

const ProfilePosts = ({ userId }: { userId: string }) => {
  const queryResult = useGetPostsByUser(userId);

  return <PostsList {...queryResult} />;
};

const profilePicSize = 128;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="fixed z-10 w-full bg-white/95 shadow-md md:max-w-2xl">
          <div className="relative h-36 bg-slate-600">
            <Image
              className="absolute bottom-0 left-0 ml-4 translate-y-1/2 rounded-full border-2 border-black"
              src={data.profileImageUrl}
              height={profilePicSize}
              width={profilePicSize}
              alt="profile-pic"
            />
          </div>
          <div className="p-4 pt-[74px] text-2xl font-bold text-slate-950">{`@${
            data.username ?? ""
          }`}</div>
        </div>
        <ProfilePosts userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

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
