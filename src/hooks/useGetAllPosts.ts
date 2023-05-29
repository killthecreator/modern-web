import { api } from "~/utils/api";

export const useGetAllPosts = () =>
  api.posts.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
