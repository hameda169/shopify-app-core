import path from 'path';
import { spawn } from 'child_process';
import { build } from './build-dist.js';

export interface DeployOptions {
  rootDir?: string;
  outDir?: string;
  /** Build the dist bundle before deploying. Default false: callers usually
   *  run `build` then compile the SDK assets, then `deploy`. */
  buildFirst?: boolean;
  /** Extra args appended to `shopify app deploy`. */
  extraArgs?: string[];
}

export async function deploy(options: DeployOptions = {}): Promise<void> {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const outDir = path.resolve(rootDir, options.outDir ?? 'dist');

  if (options.buildFirst) {
    await build({ rootDir, outDir });
  }

  const args = ['app', 'deploy', '-f', '--path', outDir, ...(options.extraArgs ?? [])];
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
