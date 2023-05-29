import { api } from "~/utils/api";

export const useGetPostsBySearch = (content: string) =>
  api.search.getPostsByContent.useInfiniteQuery(
    { content },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
