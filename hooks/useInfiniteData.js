import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteData(queryKey, fetchFn, options = {}) {
  const { limit = 10, enabled = true, ...additionalArgs } = options;

  return useInfiniteQuery({
    queryKey: [queryKey, additionalArgs],
    queryFn: ({ pageParam = 1 }) =>
      fetchFn({ page: pageParam, limit, ...additionalArgs }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
  });
}
