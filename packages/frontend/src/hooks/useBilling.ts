import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type BillingInfo, getBilling, type PlanName, updateBilling } from '../api/billing';

const BILLING_QUERY_KEY = ['billing'] as const;

export function useBillingQuery() {
  return useQuery<BillingInfo>({ queryKey: BILLING_QUERY_KEY, queryFn: getBilling });
}

export function useUpdateBillingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: PlanName) => updateBilling(plan),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
      queryClient.setQueryData(BILLING_QUERY_KEY, saved);
    },
  });
}
