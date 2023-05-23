import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useState } from "react";

import { type RouterOutputs, api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

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
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="user-image"
        className="rounded-full"
        width="56"
        height="56"
      />
      <input
        placeholder="Type some emojis!"
        type="text"
        className="grow bg-transparent outline-none"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={isPosting}
      />
      {inputVal !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: inputVal })}
          disabled={isPosting}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="relative">
          <LoadingPage />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <li
      className="flex items-center gap-3 border-b border-slate-400 p-4"
      key={post.id}
    >
      <Image
        width="56"
        height="56"
        className=" rounded-full"
        src={author.profileImageUrl}
        alt="profile-pic"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <Link href={`/${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>

          <span>·</span>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-2xl"> {post.content}</span>
      </div>
    </li>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <LoadingPage />;

  if (!data) return <p>Opps... Something went wrong</p>;

  return (
    <ul className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
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
        <div className="flex border-b border-slate-400 p-4">
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
