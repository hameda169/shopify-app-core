import type { EmbedStatus } from '@hameda169/shopify-core-shared';

export type { EmbedStatus };

export const EMBED_ENDPOINT = '/api/check-app-embed';

export async function getEmbedStatus(): Promise<EmbedStatus> {
  const resp = await fetch(EMBED_ENDPOINT);
  if (!resp.ok) throw new Error('Failed to check app embed');
  return (await resp.json()) as EmbedStatus;
}
