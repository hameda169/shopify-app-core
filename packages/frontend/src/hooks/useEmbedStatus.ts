import { useQuery } from '@tanstack/react-query';

import { type EmbedStatus, getEmbedStatus } from '../api/embed';

const EMBED_QUERY_KEY = ['theme-embed-status'] as const;

export function useEmbedStatusQuery() {
  return useQuery<EmbedStatus>({ queryKey: EMBED_QUERY_KEY, queryFn: getEmbedStatus });
}
