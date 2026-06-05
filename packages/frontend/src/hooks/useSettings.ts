import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, updateSettings } from '../api/settings';

const SETTINGS_QUERY_KEY = ['settings'] as const;

/** T is the app-specific settings shape. */
export function useSettingsQuery<T>() {
  return useQuery<T>({ queryKey: SETTINGS_QUERY_KEY, queryFn: getSettings<T> });
}

export function useUpdateSettingsMutation<T>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: T) => updateSettings(settings),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      queryClient.setQueryData(SETTINGS_QUERY_KEY, saved);
    },
  });
}
