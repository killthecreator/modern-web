import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import { cn } from "~/lib/utils";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = ({
  post,
  author,
  full,
}: PostWithUser & { separator?: boolean; full?: boolean }) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-[max-content,_1fr] gap-3 p-4",
        full
          ? "absolute left-0 top-0 translate-y-[calc(50vh_-_50%)]  shadow-lg"
          : "relative hover:scale-105"
      )}
      key={post.id}
    >
      <Image
        width="56"
        height="56"
        className="rounded-full"
        src={author.profileImageUrl}
        alt="profile-pic"
      />
      <div className="flex flex-col overflow-hidden text-slate-950">
        <div className="flex gap-1 font-bold">
          <Link
            href={`/${author.username}`}
            className="cursor-pointer hover:underline"
          >
            <span>{`@${author.username}`}</span>
          </Link>
          <span>·</span>
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>

        {full ? (
          <span className="break-words text-2xl">{post.content}</span>
        ) : (
          <Link href={`/post/${post.id}`} className={"cursor-default truncate"}>
            <span className="cursor-pointer break-words  text-2xl hover:underline">
              {post.content}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PostView;
