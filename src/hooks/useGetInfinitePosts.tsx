import { api } from "~/utils/api";

type ApiEndpoint = "getAll" | "getPostsByUserId";
type useGetInfinitePostsArgs = {
  apiEndpoint: ApiEndpoint;
  userId: string | undefined;
};
