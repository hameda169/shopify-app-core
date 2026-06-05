import type { DateRange } from '@hameda169/shopify-core-shared';

export type { DateRange };

export const ANALYTICS_ENDPOINT = '/api/analytics';

/** T is the app-specific analytics response shape (each app's dashboard differs). */
export async function getAnalytics<T>(range: DateRange): Promise<T> {
  const url = `${ANALYTICS_ENDPOINT}?range=${encodeURIComponent(range)}`;
  const resp = await fetch(url);
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to fetch analytics');
  return (await resp.json()) as T;
}
