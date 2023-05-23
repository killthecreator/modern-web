import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import { Separator } from "~/components/ui";
import { cn } from "~/lib/utils";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = ({
  post,
  author,
  separator,
  full,
}: PostWithUser & { separator?: boolean; full?: boolean }) => {
  return (
    <li
      className={cn(
        "grid cursor-pointer grid-cols-[max-content,_1fr] gap-3 p-4 ",
        !full && "relative hover:scale-105 [&>.separator]:hover:scale-[95.5%]"
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
          <Link href={`/${author.username}`} className="hover:underline">
            <span>{`@${author.username}`}</span>
          </Link>

          <span>·</span>

          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <Link
          href={`/post/${post.id}`}
          className={cn("text-2xl", !full ? "truncate" : "h-fit")}
        >
          <span>{post.content}</span>
        </Link>
      </div>
      {separator && (
        <Separator className="separator absolute bottom-0 left-0 w-full" />
      )}
    </li>
  );
};

export default PostView;
