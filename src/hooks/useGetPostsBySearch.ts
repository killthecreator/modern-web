import { api } from "~/utils/api";

export const useGetPostsBySearch = (content: string) =>
  api.search.getPostsByContent.useInfiniteQuery(
    { content },
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
