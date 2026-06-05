import Router from "@koa/router";

import { webhookAuth } from "../middleware/webhookAuth.js";
import { markShopAsUninstalled } from "../services/shopService.js";

import type { WebhookContext } from "../types.js";

/**
 * Webhook router preloaded with webhookAuth and the base handlers every app
 * needs: app/scopes_update, app/uninstalled and app/compliance (GDPR).
 * Add app-specific topics (e.g. orders_paid) onto the returned router.
 */
export function createWebhookRouter(prefix = "/webhooks"): Router {
  const router = new Router({ prefix });

  router.use(webhookAuth);

  router.post("/app/scopes_update", (ctx: WebhookContext) => {
    const shop = ctx.state.webhookShop;
    console.log("app/scopes_update", { shop, body: JSON.stringify(ctx.request.body as unknown, null, 4) });
    ctx.body = { success: true };
  });

  router.post("/app/uninstalled", async (ctx: WebhookContext) => {
    const shop = ctx.state.webhookShop;
    await markShopAsUninstalled(shop);
    ctx.body = { success: true };
  });

  // One endpoint for customers/data_request, customers/redact, shop/redact
  router.post("/app/compliance", (ctx: WebhookContext) => {
    const shop = ctx.state.webhookShop;
    console.log("compliance/data_request", { shop, body: JSON.stringify(ctx.request.body as unknown, null, 4) });
    ctx.body = { success: true };
  });

  return router;
}
