import { useQuery } from '@tanstack/react-query';

import { type DateRange, getAnalytics } from '../api/analytics';

const ANALYTICS_QUERY_KEY = ['analytics'] as const;

/** T is the app-specific analytics response shape. */
export function useAnalyticsQuery<T>(range: DateRange) {
  return useQuery<T>({
    queryKey: [...ANALYTICS_QUERY_KEY, range],
    queryFn: () => getAnalytics<T>(range),
  });
}
