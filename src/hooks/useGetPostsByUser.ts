import { api } from "~/utils/api";

export const useGetPostsByUser = (userId: string) =>
  api.posts.getPostsByUserId.useInfiniteQuery(
    { userId },
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
