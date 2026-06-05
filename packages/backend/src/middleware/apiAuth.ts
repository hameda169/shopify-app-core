import { exchangeToken, getSessionById, getShopify } from "../lib/shopify.js";
import { ApiContext } from "../types.js";

import type { Session as ShopifySession } from "@shopify/shopify-api";
import type { Next } from "koa";

async function fetchSession({
  authHeader,
  shopDomain,
  isOnline,
}: {
  authHeader: string;
  shopDomain: string;
  isOnline: boolean;
}): Promise<ShopifySession | null> {
  const sessionId =
    (await getShopify().session.getCurrentId({
      isOnline,
      rawRequest: { headers: { Authorization: authHeader } },
    })) ?? "";
  const session = await getSessionById(sessionId, isOnline);
  if (session == null) {
    return await exchangeToken({ idToken: authHeader.split(" ")[1], shop: shopDomain, online: isOnline });
  }
  return session;
}

export async function apiAuth(ctx: ApiContext, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;
    const authToken = authHeader?.split(" ")[1];

    if (authToken == null || authToken === "" || authHeader == null) {
      throw new Error("Missing auth headers");
    }

    const isOnline = true;
    const shopDomain = (await getShopify().session.decodeSessionToken(authToken)).dest.replace("https://", "");

    const session = await fetchSession({ authHeader, shopDomain, isOnline });

    if (session == null) {
      throw new Error("Invalid authorization header");
    }

    ctx.state.userSession = session;
    ctx.state.userShop = shopDomain;
  } catch (e) {
    console.error("API Auth Error:", e);
    ctx.status = 401;
    ctx.body = { error: "Unauthorized call" };
    return;
  }

  await next();
}
