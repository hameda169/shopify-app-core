#!/usr/bin/env node
import { build } from './build-dist.js';
import { deploy } from './deploy.js';

interface Flags {
  root?: string;
  out?: string;
  build: boolean;
  allowUpdates: boolean;
  allowDeletes: boolean;
  sourceControlUrl?: string;
  noRelease: boolean;
  rest: string[];
}

function parse(argv: string[]): Flags {
  const flags: Flags = {
    build: false,
    allowUpdates: true,
    allowDeletes: false,
    noRelease: false,
    rest: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') flags.root = argv[++i];
    else if (a === '--out') flags.out = argv[++i];
    else if (a === '--build') flags.build = true;
    else if (a === '--allow-updates') flags.allowUpdates = true;
    else if (a === '--no-allow-updates') flags.allowUpdates = false;
    else if (a === '--allow-deletes') flags.allowDeletes = true;
    else if (a === '--source-control-url') flags.sourceControlUrl = argv[++i];
    else if (a === '--no-release') flags.noRelease = true;
    else if (a === '--') flags.rest.push(...argv.slice(i + 1)), (i = argv.length);
    else flags.rest.push(a);
  }
  return flags;
}

const USAGE = `shopify-core-app — build/deploy the Shopify CLI app folder

Usage:
  shopify-core-app build  [--root <dir>] [--out <dir>]
  shopify-core-app deploy [--root <dir>] [--out <dir>] [--build]
                          [--no-allow-updates] [--allow-deletes]
                          [--source-control-url <url>] [--no-release]
                          [-- <shopify args>]

Commands:
  build    Render extensions + shopify.app.toml into the out dir (default: dist),
           substituting {{ env.NAME }} from .env / process.env.
  deploy   Run \`shopify app deploy --path <out>\`. Pass --build to build first
           (normally: build -> compile SDK assets -> deploy).

Deploy flags:
  --allow-updates        Permit creating/updating app config + extensions.
                         On by default; CLI 4 requires it for unattended runs.
  --no-allow-updates     Turn that permission off.
  --allow-deletes        Permit deleting config/extensions missing from the
                         build. Off by default — leave it off in CI, since a
                         partial build would remove live extensions.
  --source-control-url   Commit permalink to record against the app version.
  --no-release           Create the version without releasing it to users.

Requires Shopify CLI 4+ (CLI 4 removed the --force flag this used to pass).
Authenticate non-interactively with SHOPIFY_APP_AUTOMATION_TOKEN.
`;

async function main(): Promise<void> {
  const [cmd, ...argv] = process.argv.slice(2);
  const flags = parse(argv);

  switch (cmd) {
    case 'build':
      await build({ rootDir: flags.root, outDir: flags.out });
      break;
    case 'deploy':
      await deploy({
        rootDir: flags.root,
        outDir: flags.out,
        buildFirst: flags.build,
        allowUpdates: flags.allowUpdates,
        allowDeletes: flags.allowDeletes,
        sourceControlUrl: flags.sourceControlUrl,
        noRelease: flags.noRelease,
        extraArgs: flags.rest,
      });
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(USAGE);
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
