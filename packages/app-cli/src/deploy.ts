import path from 'path';
import { spawn } from 'child_process';
import { build } from './build-dist.js';

export interface DeployOptions {
  rootDir?: string;
  outDir?: string;
  /** Build the dist bundle before deploying. Default false: callers usually
   *  run `build` then compile the SDK assets, then `deploy`. */
  buildFirst?: boolean;
  /** Allow creating and updating app config + extensions. Default true.
   *  CLI 4 replaced the blanket `--force` with this; without it a
   *  non-interactive deploy has nothing it is permitted to change. */
  allowUpdates?: boolean;
  /** Allow deleting app config + extensions that are absent from the build.
   *  Default false, and it should stay false in unattended pipelines: a
   *  partial build would otherwise remove live extensions from merchant
   *  stores. Opt in only for deliberate manual runs. */
  allowDeletes?: boolean;
  /** Commit permalink recorded against the app version, surfaced in the Dev
   *  Dashboard so a released version maps back to a revision. */
  sourceControlUrl?: string;
  /** Create the app version without releasing it to users. Promote later with
   *  `shopify app release`. */
  noRelease?: boolean;
  /** Extra args appended to `shopify app deploy`. */
  extraArgs?: string[];
}

/** Build the `shopify app deploy` argv. Exported for testing/inspection. */
export function deployArgs(outDir: string, options: DeployOptions = {}): string[] {
  const args = ['app', 'deploy', '--path', outDir];

  if (options.allowUpdates ?? true) args.push('--allow-updates');
  if (options.allowDeletes) args.push('--allow-deletes');
  if (options.sourceControlUrl) args.push('--source-control-url', options.sourceControlUrl);
  if (options.noRelease) args.push('--no-release');

  return [...args, ...(options.extraArgs ?? [])];
}

export async function deploy(options: DeployOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const outDir = path.resolve(rootDir, options.outDir ?? 'dist');

  if (options.buildFirst) {
    await build({ rootDir, outDir });
  }

  const args = deployArgs(outDir, options);
  console.log(`Running: shopify ${args.join(' ')}`);

  await new Promise<void>((resolve, reject) => {
    // node_modules/.bin is on PATH when invoked via an npm/yarn script.
    const child = spawn('shopify', args, { stdio: 'inherit', cwd: rootDir });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`shopify app deploy exited with code ${code}`)),
    );
  });
}
