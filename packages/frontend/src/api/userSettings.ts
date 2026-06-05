export interface UserSettings {
  shopUrl: string;
  emailAddress: string;
  emailUpdates: boolean;
  weeklyReports: boolean;
}

export const USER_SETTINGS_ENDPOINT = '/api/user-settings';

export async function getUserSettings(): Promise<UserSettings> {
  const resp = await fetch(USER_SETTINGS_ENDPOINT);
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to fetch user settings');
  return (await resp.json()) as UserSettings;
}

export async function updateUserSettings(settings: UserSettings): Promise<UserSettings> {
  const resp = await fetch(USER_SETTINGS_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to save user settings');
  return (await resp.json()) as UserSettings;
}
