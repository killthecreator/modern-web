import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

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

export default PostView;
