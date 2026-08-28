# shopify-app-core

Shared core packages for our Shopify apps, published under the `@hameda169` scope.

| Package | Layer | Contents |
|---|---|---|
| `@hameda169/shopify-core-backend` | Koa + TypeORM server | Shopify client, token-exchange auth, api/webhook middleware, base entities (Shop, Session, Subscription, UserSettings), base webhooks (uninstalled, scopes_update, GDPR compliance), shop-info / check-app-embed routes, app factory |
| `@hameda169/shopify-core-frontend` | React admin (Polaris) | api clients (billing, settings, user-settings, analytics, embed), react-query hooks, CustomCard/SaveBar/PolarisRouterLink components, parameterized AppLayout, color utils |
| `@hameda169/shopify-core-sdk` | Storefront utils (framework-free) | device detection, uuid, postEvent (sendBeacon+fetch), fetchConfig, product-form DOM helpers, Shopify window typings |
| `@hameda169/shopify-core-shared` | Cross-layer types | DeviceType, PlanName, SubscriptionStatus, DateRange, BillingInfo, EmbedStatus, CollectEventPayload |
| `@hameda169/shopify-core-app-cli` | Shopify CLI app folder (tooling) | `shopify-core-app build`/`deploy`, `{{ env.NAME }}` substitution into `extensions/` + `shopify.app.toml`, base theme-extension and app.toml templates |

## Rules

- **Migrations always live in the app**, never here. Core exports entity classes; each app registers them in its own DataSource and owns its migration history.
- Framework deps (`koa`, `typeorm`, `@shopify/shopify-api`, ...) are **peerDependencies** — the app controls their versions.
- Packages ship compiled ESM (`dist/`); run `npm run build` before publishing.
  `app-cli` additionally ships its `templates/` directory.

## Using `@hameda169/shopify-core-backend` in an app

```ts
// backend/src/database/data-source.ts
import "dotenv/config";
import { createCoreDataSource } from "@hameda169/shopify-core-backend";
import { AppSettings, AnalyticsEvent } from "./entities";

export const AppDataSource = createCoreDataSource({
  entities: [AppSettings, AnalyticsEvent],
  migrations: ["src/database/migrations/*.ts"],
});
```

```ts
// backend/src/index.ts
import { apiAuth, createApp, createCoreApiRoutes, createWebhookRouter, startApp } from "@hameda169/shopify-core-backend";
import Router from "@koa/router";
import { AppDataSource } from "./database/data-source";

const apiRouter = new Router({ prefix: "/api" });
apiRouter.use(apiAuth);
apiRouter.use(createCoreApiRoutes().routes()); // /shop-info, /check-app-embed
// ... mount app-specific api routes

const webhookRouter = createWebhookRouter(); // uninstalled, scopes_update, compliance
webhookRouter.post("/app/orders_paid", myOrdersPaidHandler); // app-specific topics

const app = createApp({ routers: [apiRouter, webhookRouter /*, publicRouter */] });
await startApp(app, { dataSource: AppDataSource });
```

Required env: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_API_SCOPES`, `SHOPIFY_APP_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Optional: `SHOPIFY_API_VERSION`, `PORT`, `SHOPIFY_APP_EMBED_BLOCK_NAME`, `SHOPIFY_APP_EMBED_EXTENSION_ID`.

## Using `@hameda169/shopify-core-app-cli` in an app

Replaces the per-app `shopify-app/scripts/build-dist.ts`. Add the dep and wire
the scripts in `shopify-app/package.json`:

```json
{
  "scripts": {
    "build:dist": "shopify-core-app build",
    "build-sdk": "(export CDIR=$(pwd) && cd ../sdk && yarn build --outDir $CDIR/dist/extensions/theme-extension/assets --emptyOutDir --sourcemap false)",
    "deploy": "yarn build:dist && yarn build-sdk && shopify-core-app deploy"
  }
}
```

`build` renders `extensions/` and `shopify.app.toml` into the out dir (default
`dist/`), substituting every `{{ env.NAME }}` from `.env` / `process.env`, and
renames the SDK block to `$SHOPIFY_EXTENSION_NAME.liquid`. `deploy` runs
`shopify app deploy --path <out> --allow-updates`.

Requires **Shopify CLI 4+** (CLI 4 replaced `--force` with `--allow-updates` /
`--allow-deletes`). Authenticate CI with `SHOPIFY_APP_AUTOMATION_TOKEN` from the
Dev Dashboard, which supersedes `SHOPIFY_CLI_PARTNERS_TOKEN`.

Build order matters: `build` empties the out dir, so compile SDK assets **after**
`build:dist` and **before** `deploy`.

The app keeps only what is specific to it — `.env`, its own block `.liquid`, and
optionally `shopify.app.template.toml` or `app.config.json` to override scopes,
webhooks, `extensionDir`, `blockFile`, or `outDir`. Anything omitted falls back
to the templates shipped in the package. See `packages/app-cli/README.md` for the
full config table.

## Local development against an app

Use [yalc](https://github.com/wclr/yalc) instead of `npm link`:

```bash
cd packages/backend && npm run build && yalc publish
cd <app>/backend && yalc add @hameda169/shopify-core-backend
# after core changes: npm run build && yalc push
```

## Publishing (GitHub Packages)

The `@hameda169` scope matches the GitHub username `hameda169`, as GitHub
Packages requires. Each package declares:

```json
"publishConfig": { "registry": "https://npm.pkg.github.com" }
```

and publish with `npm publish -w @hameda169/shopify-core-backend`.
