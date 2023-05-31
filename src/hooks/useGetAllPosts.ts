import { api } from "~/utils/api";

export const useGetAllPosts = () =>
  api.posts.getAll.useInfiniteQuery(
    {},
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
