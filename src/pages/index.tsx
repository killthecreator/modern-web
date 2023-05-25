import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postWithUser";
import {
  Button,
  Textarea,
  useToast,
  Alert,
  AlertTitle,
  AlertDescription,
  Input,
} from "~/components/ui";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useIntersectionObserver } from "~/utils/hooks";

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
      {!isUsername && (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in">
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
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.posts.getAll.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchInterval: 5000,
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
      <ul className="mt-[200px] h-min">
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

const Home: NextPage = () => {
  const { isSignedIn } = useUser();
  return (
    <>
      <Head>
        <title>Homepage</title>
      </Head>
      <PageLayout>
        <div className="fixed z-10 w-full bg-white/95  md:max-w-2xl">
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
