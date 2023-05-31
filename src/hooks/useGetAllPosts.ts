import { useState } from "react";

import { api } from "~/utils/api";

export const useGetAllPosts = () => {
  const [enbaled, setEnabled] = useState(true);

  return api.posts.getAll.useInfiniteQuery(
    {},
    {
      enabled: enbaled,
      onSuccess: () => {
        setEnabled(false);
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
