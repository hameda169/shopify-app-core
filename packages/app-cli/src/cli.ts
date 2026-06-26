#!/usr/bin/env node
import { build } from './build-dist.js';
import { deploy } from './deploy.js';

interface Flags {
  root?: string;
  out?: string;
  build: boolean;
  rest: string[];
}

function parse(argv: string[]): Flags {
  const flags: Flags = { build: false, rest: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') flags.root = argv[++i];
    else if (a === '--out') flags.out = argv[++i];
    else if (a === '--build') flags.build = true;
    else if (a === '--') flags.rest.push(...argv.slice(i + 1)), (i = argv.length);
    else flags.rest.push(a);
  }
  return flags;
}

const USAGE = `shopify-core-app — build/deploy the Shopify CLI app folder

Usage:
  shopify-core-app build  [--root <dir>] [--out <dir>]
  shopify-core-app deploy [--root <dir>] [--out <dir>] [--build] [-- <shopify args>]

Commands:
  build    Render extensions + shopify.app.toml into the out dir (default: dist),
           substituting {{ env.NAME }} from .env / process.env.
  deploy   Run \`shopify app deploy -f --path <out>\`. Pass --build to build first
           (normally: build -> compile SDK assets -> deploy).
`;

async function main(): Promise<void> {
  const [cmd, ...argv] = process.argv.slice(2);
  const flags = parse(argv);

  switch (cmd) {
    case 'build':
      await build({ rootDir: flags.root, outDir: flags.out });
      break;
    case 'deploy':
      await deploy({ rootDir: flags.root, outDir: flags.out, buildFirst: flags.build, extraArgs: flags.rest });
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
