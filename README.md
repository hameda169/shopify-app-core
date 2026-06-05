# shopify-app-core

Shared core packages for our Shopify apps, published under the `@hameda169` scope.

| Package | Layer | Contents |
|---|---|---|
| `@hameda169/shopify-core-backend` | Koa + TypeORM server | Shopify client, token-exchange auth, api/webhook middleware, base entities (Shop, Session, Subscription, UserSettings), base webhooks (uninstalled, scopes_update, GDPR compliance), shop-info / check-app-embed routes, app factory |
| `@hameda169/shopify-core-frontend` | React admin (Polaris) | _planned_ |
| `@hameda169/shopify-core-sdk` | Storefront widget (Preact) | _planned_ |
| `@hameda169/shopify-core-shared` | Cross-layer types | _planned_ |

## Rules

- **Migrations always live in the app**, never here. Core exports entity classes; each app registers them in its own DataSource and owns its migration history.
- Framework deps (`koa`, `typeorm`, `@shopify/shopify-api`, ...) are **peerDependencies** — the app controls their versions.
- Packages ship compiled ESM (`dist/`); run `npm run build` before publishing.

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

## Local development against an app

Use [yalc](https://github.com/wclr/yalc) instead of `npm link`:

```bash
cd packages/backend && npm run build && yalc publish
cd <app>/backend && yalc add @hameda169/shopify-core-backend
# after core changes: npm run build && yalc push
```

## Publishing (GitHub Packages — pending setup)

The `@hameda169` scope matches the GitHub username `hameda169`, as GitHub
Packages requires. When ready to publish, add to each package:

```json
"publishConfig": { "registry": "https://npm.pkg.github.com" }
```

and publish with `npm publish -w @hameda169/shopify-core-backend`.
