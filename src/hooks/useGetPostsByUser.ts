import { api } from "~/utils/api";

export const useGetPostsByUser = (userId: string) =>
  api.posts.getPostsByUserId.useInfiniteQuery(
    { userId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
