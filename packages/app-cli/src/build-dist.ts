import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { loadConfig, type ResolvedConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Templates ship inside the package (dist/ is one level below package root). */
const PACKAGE_TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');

/** Replace every `{{ env.NAME }}` with process.env.NAME (empty if unset). */
const ENV_PLACEHOLDER = /\{\{\s*env\.([A-Z0-9_]+)\s*\}\}/g;
function replacePlaceholders(content: string): string {
  return content.replace(ENV_PLACEHOLDER, (_m, name: string) => process.env[name] ?? '');
}

async function substituteInTree(dir: string): Promise<void> {
  for (const item of await fs.readdir(dir)) {
    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      await substituteInTree(itemPath);
    } else if (stat.isFile()) {
      try {
        const content = await fs.readFile(itemPath, 'utf-8');
        const next = replacePlaceholders(content);
        if (next !== content) {
          await fs.writeFile(itemPath, next);
          console.log(`  substituted ${path.relative(dir, itemPath) || item}`);
        }
      } catch {
        // binary or unreadable (e.g. assets/main.js) — leave as-is
      }
    }
  }
}

/** Prefer an app-local file; fall back to the packaged template. */
async function resolveSource(rootDir: string, relPath: string): Promise<string | null> {
  const local = path.join(rootDir, relPath);
  if (await fs.pathExists(local)) return local;
  const packaged = path.join(PACKAGE_TEMPLATES_DIR, relPath);
  if (await fs.pathExists(packaged)) return packaged;
  return null;
}

export interface BuildOptions {
  /** App folder to build (the `shopify-app` dir). Default: process.cwd(). */
  rootDir?: string;
  /** Override output dir (relative to rootDir). Default: from config. */
  outDir?: string;
}

export async function build(options: BuildOptions = {}): Promise<string> {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  dotenv.config({ path: path.join(rootDir, '.env') });

  const cfg = await loadConfig(rootDir);
  const outDir = path.resolve(rootDir, options.outDir ?? cfg.outDir);

  console.log(`Building ${path.relative(process.cwd(), rootDir) || '.'} -> ${path.relative(rootDir, outDir)}/`);

  await fs.emptyDir(outDir);

  // dist/package.json — name from SHOPIFY_PACKAGE_APP_NAME (Shopify CLI reads it)
  await fs.writeJson(
    path.join(outDir, 'package.json'),
    { name: process.env.SHOPIFY_PACKAGE_APP_NAME ?? process.env.SHOPIFY_APP_NAME ?? 'shopify-app' },
    { spaces: 2 },
  );

  // Extensions: always sourced from the app (holds app-specific liquid + assets)
  const distExtensions = path.join(outDir, 'extensions');
  await fs.copy(cfg.extensionsDir, distExtensions);
  await substituteInTree(distExtensions);

  // Rename the SDK block file to the configured env value, if enabled
  await maybeRenameBlock(cfg, distExtensions);

  // shopify.app.toml from template (app-local override, else packaged default)
  const templatePath = await resolveSource(rootDir, 'shopify.app.template.toml');
  if (templatePath) {
    const rendered = replacePlaceholders(await fs.readFile(templatePath, 'utf-8'));
    await fs.writeFile(path.join(outDir, 'shopify.app.toml'), rendered);
    console.log(`  rendered shopify.app.toml`);
  } else {
    console.warn('  WARN: no shopify.app.template.toml (app or package) — skipped');
  }

  console.log('Build complete.');
  return outDir;
}

async function maybeRenameBlock(cfg: ResolvedConfig, distExtensions: string): Promise<void> {
  if (!cfg.renameBlockToEnv) return;
  const target = process.env[cfg.renameBlockToEnv];
  if (!target) return;
  const blocksDir = path.join(distExtensions, cfg.extensionDir, 'blocks');
  const from = path.join(blocksDir, cfg.blockFile);
  if (await fs.pathExists(from)) {
    const to = path.join(blocksDir, `${target}.liquid`);
    await fs.rename(from, to);
    console.log(`  renamed ${cfg.blockFile} -> ${target}.liquid`);
  }
}
