import { useState } from "react";

import { api } from "~/utils/api";

export const useGetPostsBySearch = (content: string) => {
  const [enbaled, setEnabled] = useState(true);

  return api.search.getPostsByContent.useInfiniteQuery(
    { content },
    {
      enabled: enbaled,
      onSuccess: () => {
        setEnabled(false);
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
