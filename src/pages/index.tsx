import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";

import Image from "next/image";
import { useState } from "react";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postWithUser";
import { Button, Separator, Textarea, useToast } from "~/components/ui";
import { Send } from "lucide-react";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [inputVal, setInputVal] = useState("");

  const ctx = api.useContext();
  const { toast } = useToast();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInputVal("");
      void ctx.posts.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      toast({
        title:
          errorMessage && errorMessage[0]
            ? errorMessage[0]
            : "Failed to post. Try again later",
      });
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

      <Textarea
        placeholder="Type something!"
        className="grow bg-transparent text-slate-950 outline-none"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={isPosting}
      />
      {!isPosting ? (
        <Button
          className="flex items-center gap-2"
          onClick={() => mutate({ content: inputVal })}
          disabled={!inputVal}
        >
          <Send />
          <span>Post</span>
        </Button>
      ) : (
        <div className="w-[125px]">
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
        <li key={fullPost.post.id}>
          <PostView {...fullPost} />
          {index !== data.length - 1 && <Separator />}
        </li>
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
