import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserSettings, updateUserSettings, type UserSettings } from '../api/userSettings';

const USER_SETTINGS_QUERY_KEY = ['user-settings'] as const;

export function useUserSettingsQuery() {
  return useQuery({ queryKey: USER_SETTINGS_QUERY_KEY, queryFn: getUserSettings });
}

export function useUpdateUserSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: UserSettings) => updateUserSettings(settings),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QUERY_KEY });
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, saved);
    },
  });
}
