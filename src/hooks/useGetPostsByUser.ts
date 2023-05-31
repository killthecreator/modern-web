import { useState } from "react";

import { api } from "~/utils/api";

export const useGetPostsByUser = (userId: string) => {
  const [enbaled, setEnabled] = useState(true);

  return api.posts.getPostsByUserId.useInfiniteQuery(
    { userId },
    {
      enabled: enbaled,
      onSuccess: () => {
        setEnabled(false);
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
