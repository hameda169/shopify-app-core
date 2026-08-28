# @hameda169/shopify-core-app-cli

Build/deploy tooling and base config templates for the Shopify CLI app folder
(the `shopify-app/` directory that holds theme app extensions).

It replaces the per-app `scripts/build-dist.ts` + ad-hoc `sed`/deploy scripts
that had drifted across apps.

## What it does

- **`shopify-core-app build`** — renders `extensions/` and `shopify.app.toml`
  into an out dir (default `dist/`), substituting every `{{ env.NAME }}` with the
  matching variable from `.env` / `process.env`. Optionally renames the SDK block
  file to `$SHOPIFY_EXTENSION_NAME.liquid`.
- **`shopify-core-app deploy`** — runs `shopify app deploy --path <out>`,
  passing `--allow-updates` by default. Pass `--build` to build first.

## Requires Shopify CLI 4+

CLI 4 removed the blanket `--force` flag this package used to pass, splitting it
into `--allow-updates` (create/update) and `--allow-deletes` (remove). The peer
range is therefore `@shopify/cli@^4.0.0`; on CLI 3 the deploy will fail on the
unknown flags.

| flag | default | meaning |
| --- | --- | --- |
| `--allow-updates` / `--no-allow-updates` | on | permit creating and updating app config + extensions |
| `--allow-deletes` | off | permit deleting config/extensions absent from the build |
| `--source-control-url <url>` | – | commit permalink recorded against the app version |
| `--no-release` | off | create the version without releasing it to users |

Leave `--allow-deletes` off in unattended pipelines: `deploy` ships the whole
project as one unit, so a partial build would delete live extensions from
merchant stores. Opt in only for deliberate manual runs.

## Non-interactive auth

Authenticate CI with an **app automation token** from the Dev Dashboard
(Settings -> App Automation Token), exported as `SHOPIFY_APP_AUTOMATION_TOKEN`.
It supersedes the Partner Dashboard's `SHOPIFY_CLI_PARTNERS_TOKEN`, is scoped to
a single app, and expires after 1/3/6 months — rotate it before it lapses or CI
starts failing.

```bash
export SHOPIFY_APP_AUTOMATION_TOKEN="..."
yarn deploy
```

## Per-app contract

The app's `shopify-app/` keeps only what's specific to it:

- `.env` — `SHOPIFY_*` values (referenced as `{{ env.NAME }}` in templates)
- `extensions/<dir>/blocks/*.liquid` — the app's actual block code
- `extensions/<dir>/assets/main.js` — compiled by the app's own `build-sdk` step
- *(optional)* `shopify.app.template.toml` — override scopes / webhooks / api_version
- *(optional)* `app.config.json` — override `extensionDir`, `blockFile`, etc.

Anything omitted falls back to the templates shipped in this package.

## Typical app package.json

```json
{
  "scripts": {
    "build:dist": "shopify-core-app build",
    "build-sdk": "(export CDIR=$(pwd) && cd ../sdk && yarn build --outDir $CDIR/dist/extensions/theme-extension/assets --emptyOutDir --sourcemap false)",
    "deploy": "yarn build:dist && yarn build-sdk && shopify-core-app deploy"
  }
}
```

Build order matters: `build` empties the out dir, so compile SDK assets **after**
`build:dist` and **before** `deploy`.

## Config (`app.config.json`, all optional)

| field              | default                         | meaning                                            |
| ------------------ | ------------------------------- | -------------------------------------------------- |
| `extensionDir`     | lone child of `extensions/`     | extension folder name (`theme-extension`, …)       |
| `blockFile`        | `main-sdk.liquid`               | SDK entry block to rename                           |
| `renameBlockToEnv` | `SHOPIFY_EXTENSION_NAME`        | env var the block is renamed to; `null` to disable |
| `outDir`           | `dist`                          | build output dir                                    |
