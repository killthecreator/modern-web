import { useState } from "react";
import { useForm } from "react-hook-form";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import PostsList from "~/components/postsList";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Textarea,
  useToast,
} from "~/components/ui";
import { useGetAllPosts } from "~/hooks";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

const maxInputVal = 200;
const PostSearcher = () => {
  type SearchFormData = { search: string };
  const { register, handleSubmit } = useForm<SearchFormData>();
  const router = useRouter();

  const onSubmit = async ({ search }: SearchFormData) => {
    await router.push({ pathname: "search", query: { result: search } });
  };

  return (
    <form
      className="flex w-full items-center gap-3 p-4 shadow"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input {...register("search")} placeholder="Search for posts" />
      <Button type="submit">Search</Button>
    </form>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();
  const [inputVal, setInputVal] = useState("");
  const ctx = api.useContext();
  const { toast } = useToast();
  const [isUsername, setIsUsername] = useState(!!user && !!user.username);

  type UsernameFormData = { username: string };
  const { register, handleSubmit } = useForm<UsernameFormData>();
  const { mutate: updateUser } = api.profile.updateUsername.useMutation();

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

  const onSubmit = ({ username }: UsernameFormData) => {
    updateUser({ id: user.id, username });
    setIsUsername(true);
  };

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
      <div className="relative grow">
        <Textarea
          placeholder="Type something!"
          className={cn(
            "scrollbar-hide bg-transparent text-slate-950 outline-none",
            inputVal.length > maxInputVal &&
              "outline-red-300 focus-visible:outline-red-300"
          )}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isPosting}
        />
        <span
          className={cn(
            "absolute bottom-1 right-3 text-xs text-slate-300",
            inputVal.length > maxInputVal && "text-red-300"
          )}
        >
          {maxInputVal - inputVal.length}
        </span>
      </div>

      {!isPosting ? (
        <Button
          className="flex items-center gap-2"
          onClick={() => mutate({ content: inputVal })}
          disabled={!inputVal || inputVal.length > maxInputVal}
        >
          <Send />
          <span>Post</span>
        </Button>
      ) : (
        <div className="w-[125px]">
          <LoadingPage />
        </div>
      )}
      {!isUsername && (
        <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Alert
              className="flex max-w-[400px] flex-col 
            gap-4 "
            >
              <AlertTitle>Username was not provided</AlertTitle>
              <AlertDescription className="">
                We could not catch a username from your authentification method.
                Please provide it below
              </AlertDescription>
              <Input {...register("username")} placeholder="Username"></Input>
              <Button type="submit" className="w-36 self-center">
                Submit
              </Button>
            </Alert>
          </form>
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const queryResult = useGetAllPosts();

  return <PostsList {...queryResult} />;
};

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  return (
    <>
      <Head>
        <title>Homepage</title>
      </Head>
      <PageLayout>
        <div className=" bg-white/95 md:max-w-2xl">
          <PostSearcher />
          <div className="flex justify-center rounded-lg p-4 shadow-md">
            {isSignedIn ? (
              <CreatePostWizard />
            ) : (
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
