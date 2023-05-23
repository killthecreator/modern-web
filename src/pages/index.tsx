import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";

import Image from "next/image";
import { useState } from "react";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postWithUser";
import { Button, Separator } from "~/components/ui";
import { Send } from "lucide-react";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [inputVal, setInputVal] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInputVal("");
      void ctx.posts.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post. Try again later");
      }
    },
  });

  if (!user) return null;
  return (
    <div className="flex w-full items-center gap-3">
      {
        <Image
          src={user.profileImageUrl}
          alt="user-image"
          className="rounded-full"
          width="56"
          height="56"
        />
      }

      <input
        placeholder="Type something!"
        type="text"
        className="grow bg-transparent text-slate-950 outline-none"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={isPosting}
      />
      {inputVal !== "" && !isPosting && (
        <Button
          className="flex items-center gap-2"
          onClick={() => mutate({ content: inputVal })}
        >
          <Send />
          <span>Post</span>
        </Button>
      )}
      {isPosting && (
        <div className="relative right-11">
          <LoadingPage />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery(undefined, {
    refetchInterval: 5000,
  });
  if (isLoading) return <LoadingPage />;
  if (!data) return <p>Opps... Something went wrong</p>;

  return (
    <ul>
      {data.map((fullPost, index) => (
        <PostView
          key={fullPost.post.id}
          {...fullPost}
          separator={index !== data.length - 1}
        />
      ))}
    </ul>
  );
};

const Home: NextPage = () => {
  const { isSignedIn } = useUser();
  return (
    <>
      <Head>
        <title>Homepage</title>
      </Head>
      <PageLayout>
        <div className="flex rounded-lg p-4 shadow-lg">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
