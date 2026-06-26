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
- **`shopify-core-app deploy`** — runs `shopify app deploy -f --path <out>`.
  Pass `--build` to build first.

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
