import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

import { cn } from "~/lib/utils";
import type { PostWithUser } from "~/types";
dayjs.extend(relativeTime);

const PostView = ({
  post,
  author,
  full,
}: PostWithUser & {
  separator?: boolean;
  full?: boolean;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-[max-content,_1fr] items-center gap-3 p-2 sm:p-4",
        full
          ? "absolute left-0 top-0 translate-y-[calc(50vh_-_50%)] shadow-xl"
          : "relative shadow hover:scale-105"
      )}
      key={post.id}
    >
      <Image
        width="56"
        height="56"
        className="h-[40px] w-[40px] rounded-full sm:h-[56px] sm:w-[56px] "
        src={author.profileImageUrl}
        alt="profile-pic"
      />
      <div className="flex flex-col overflow-hidden text-slate-950">
        <div className="flex gap-1 font-bold">
          <Link
            href={`/${author.username}`}
            className="cursor-pointer text-sm hover:underline md:text-base"
          >
            <span>{`@${author.username}`}</span>
          </Link>
          <span>·</span>
          <span className="text-sm font-thin md:text-base">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>

        {full ? (
          <span className="break-words text-2xl">{post.content}</span>
        ) : (
          <Link href={`/post/${post.id}`} className={"cursor-default truncate"}>
            <span className="cursor-pointer break-words text-xl hover:underline md:text-2xl">
              {post.content}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PostView;
