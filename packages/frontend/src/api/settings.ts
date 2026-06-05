export const SETTINGS_ENDPOINT = '/api/settings';

/** T is the app-specific settings shape (each app defines its own). */
export async function getSettings<T>(): Promise<T> {
  const resp = await fetch(SETTINGS_ENDPOINT);
  if (!resp.ok) throw new Error('Failed to fetch settings');
  return (await resp.json()) as T;
}

export async function updateSettings<T>(settings: T): Promise<T> {
  const resp = await fetch(SETTINGS_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!resp.ok || resp.status >= 400) throw new Error('Failed to save settings');
  return (await resp.json()) as T;
}
