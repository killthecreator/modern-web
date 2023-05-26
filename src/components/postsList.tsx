import { type RouterOutputs } from "~/utils/api";
import PostView from "./postWithUser";
import { cn } from "~/lib/utils";
import { LoadingPage } from "./loading";

import { forwardRef } from "react";
import List from "rc-virtual-list";

type PostsWithUser = RouterOutputs["posts"]["getAll"]["postsWithUserdata"];

const PostsList = forwardRef(
  (
    {
      postsWithUser,
      className = "",
      isFetchingNextPage,
    }: {
      postsWithUser: PostsWithUser;
      className?: string;
      isFetchingNextPage: boolean;
    },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <>
        <List
          className={cn(className, " h-min")}
          data={postsWithUser}
          itemKey="id"
        >
          {(fullPost) => <PostView key={fullPost.post.id} {...fullPost} />}
        </List>
        <div className="h-1 w-full" ref={ref}></div>
        {isFetchingNextPage && (
          <div className="my-10">
            <LoadingPage />
          </div>
        )}
      </>
    );
  }
);

PostsList.displayName = "PostsList";
export default PostsList;
