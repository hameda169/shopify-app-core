import type { BillingInfo, PlanName } from '@hameda169/shopify-core-shared';

export type { BillingInfo, PlanName };

export const BILLING_ENDPOINT = '/api/billing';

export async function getBilling(): Promise<BillingInfo> {
  const resp = await fetch(BILLING_ENDPOINT);
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to fetch billing info');
  return (await resp.json()) as BillingInfo;
}

export async function updateBilling(plan: PlanName): Promise<BillingInfo> {
  const resp = await fetch(BILLING_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to update plan');
  return (await resp.json()) as BillingInfo;
}
