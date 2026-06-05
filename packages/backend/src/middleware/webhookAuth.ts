import crypto from "crypto";

import { getShopify } from "../lib/shopify.js";
import { WebhookContext } from "../types.js";

import type { Next } from "koa";

export async function webhookAuth(ctx: WebhookContext, next: Next) {
  try {
    const hmac = ctx.headers["x-shopify-hmac-sha256"] as string | undefined;
    const topic = ctx.headers["x-shopify-topic"] as string | undefined;
    const shop = ctx.headers["x-shopify-shop-domain"] as string | undefined;

    if (!hmac || !topic || !shop) {
      throw new Error("Missing required webhook headers");
    }

    const rawBody = ctx.request.rawBody;
    const hash = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET ?? "")
      .update(rawBody)
      .digest("base64");

    if (!getShopify().auth.safeCompare(hash, hmac)) {
      ctx.status = 401;
      ctx.body = { error: "Invalid webhook signature" };
      return;
    }

    ctx.state.webhookTopic = topic;
    ctx.state.webhookShop = shop;
  } catch (e) {
    console.error("Webhook Auth Error:", e);
    ctx.status = 401;
    ctx.body = { error: "Unauthorized webhook call" };
    return;
  }

  try {
    await next();
  } catch (e) {
    console.error("Internal Server Error:", e);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
    return;
  }
}
