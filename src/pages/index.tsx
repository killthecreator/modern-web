import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data } = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Homepage</title>
        <meta name="description" content="Modern Web Tutorial" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b text-black">
        <div>{!user.isSignedIn ? <SignInButton /> : <SignOutButton />}</div>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <div>
          {data?.map((post) => (
            <div key={post.id}>{post.content}</div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
