import fs from 'fs-extra';
import path from 'path';

/**
 * Per-app configuration for the build. All fields are optional; sensible
 * defaults are derived from the app folder layout and environment.
 *
 * Place an `app.config.json` in the shopify-app folder to override defaults.
 */
export interface AppConfig {
  /** Directory under `extensions/` that holds the theme app extension.
   *  Default: the single child of `extensions/`, else `theme-extension`. */
  extensionDir?: string;
  /** Block file in `<extensionDir>/blocks/` that is the SDK entry block.
   *  Default: `main-sdk.liquid`. */
  blockFile?: string;
  /** Env var whose value the block file is renamed to (without extension).
   *  Default: `SHOPIFY_EXTENSION_NAME`. Set to `null`/"" to disable rename. */
  renameBlockToEnv?: string | null;
  /** Output directory for the built bundle, relative to the app folder.
   *  Default: `dist`. */
  outDir?: string;
}

export interface ResolvedConfig {
  rootDir: string;
  extensionsDir: string;
  extensionDir: string;
  blockFile: string;
  renameBlockToEnv: string | null;
  outDir: string;
}

const DEFAULTS = {
  blockFile: 'main-sdk.liquid',
  renameBlockToEnv: 'SHOPIFY_EXTENSION_NAME' as string | null,
  outDir: 'dist',
};

/** Detect the extension dir: explicit config, else the lone child of
 *  `extensions/`, else fall back to `theme-extension`. */
function detectExtensionDir(extensionsDir: string, explicit?: string): string {
  if (explicit) return explicit;
  if (fs.existsSync(extensionsDir)) {
    const children = fs
      .readdirSync(extensionsDir)
      .filter((c) => fs.statSync(path.join(extensionsDir, c)).isDirectory());
    if (children.length === 1) return children[0];
  }
  return 'theme-extension';
}

export async function loadConfig(rootDir: string): Promise<ResolvedConfig> {
  const configPath = path.join(rootDir, 'app.config.json');
  const raw: AppConfig = (await fs.pathExists(configPath))
    ? await fs.readJson(configPath)
    : {};

  const extensionsDir = path.join(rootDir, 'extensions');
  return {
    rootDir,
    extensionsDir,
    extensionDir: detectExtensionDir(extensionsDir, raw.extensionDir),
    blockFile: raw.blockFile ?? DEFAULTS.blockFile,
    renameBlockToEnv:
      raw.renameBlockToEnv === undefined
        ? DEFAULTS.renameBlockToEnv
        : raw.renameBlockToEnv || null,
    outDir: raw.outDir ?? DEFAULTS.outDir,
  };
}
