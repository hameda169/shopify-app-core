type Blocks = Record<string, { type: string; disabled: boolean }>;

interface Preset {
  blocks?: Blocks;
}

interface SettingsWithPresets<T extends string = string> {
  current: T;
  presets: Record<T, Preset>;
}

interface DirectSettings {
  current: Preset;
  presets?: undefined;
}

type Settings = SettingsWithPresets | DirectSettings;

function hasPresets(data: Settings): data is SettingsWithPresets {
  return typeof data.current === "string";
}

export function parseAndNormalizeSettings(content: string) {
  const startIndex = content.indexOf("*/\n");
  const jsonContent = content.slice(startIndex + 3);
  const settings = JSON.parse(jsonContent) as Settings;

  const currentSettings = hasPresets(settings) ? settings.presets[settings.current] : settings.current;

  return {
    ...settings,
    current: currentSettings,
  };
}
