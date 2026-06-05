import { bodyParser } from "@koa/bodyparser";
import Router from "@koa/router";
import Koa, { type Context, type Next } from "koa";

import { exchangeToken, getSessionByShopDomain } from "./lib/shopify.js";

import type { DataSource } from "typeorm";

export interface CreateAppOptions {
  /** Routers to mount (api, public, webhooks, ...), in order. */
  routers?: Router[];
}

/**
 * Standard Koa app: bodyparser, error middleware, the /install token-exchange
 * route, then the given routers.
 */
export function createApp({ routers = [] }: CreateAppOptions = {}): Koa {
  const app = new Koa();
  const router = new Router();

  router.get("/install", async (ctx: Context) => {
    const searchParams = new URLSearchParams(ctx.request.search);
    const shop = searchParams.get("shop");
    const idToken = searchParams.get("id_token");

    if (shop != null && idToken != null) {
      if ((await getSessionByShopDomain(shop, true)) == null) {
        await exchangeToken({ idToken, shop, online: true });
      }
      if ((await getSessionByShopDomain(shop, false)) == null) {
        await exchangeToken({ idToken, shop, online: false });
      }
    }

    ctx.redirect(`${process.env.SHOPIFY_APP_URL ?? ""}${ctx.request.search}`);
  });

  app.use(bodyParser());

  app.use(async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const err = error as Error & { status?: number };
      ctx.status = err.status ?? 500;
      ctx.body = { error: err.message || "Internal Server Error" };
      ctx.app.emit("error", err, ctx);
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  for (const r of routers) {
    app.use(r.routes());
    app.use(r.allowedMethods());
  }

  return app;
}

export interface StartAppOptions {
  dataSource: DataSource;
  port?: number;
}

/** Initialize the DataSource and start listening. */
export async function startApp(app: Koa, { dataSource, port }: StartAppOptions): Promise<void> {
  const listenPort = port ?? Number(process.env.PORT ?? 8000);
  try {
    await dataSource.initialize();
    console.log("Database connected");

    app.listen(listenPort, () => {
      console.log(`Koa server listening at http://0.0.0.0:${listenPort}`);
    });

    app.on("error", (err: unknown) => {
      console.error("Server error", err);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
