import {
  ApiVersion,
  LATEST_API_VERSION,
  RequestedTokenType,
  type SessionParams,
  shopifyApi,
  Session as ShopifySession,
} from "@shopify/shopify-api";

import "@shopify/shopify-api/adapters/node";
import { Session as DbSession } from "../entities/index.js";
import {
  getSessionById as getDbSessionById,
  getSessionByShop as getDbSessionByShop,
  getShopByDomain,
  saveSession as saveDbSession,
  saveShop as saveDbShop,
} from "../services/shopService.js";

export type ShopifyInstance = ReturnType<typeof shopifyApi>;

let _shopify: ShopifyInstance | null = null;

/**
 * Lazily created Shopify API client, configured from env on first use:
 * SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, SHOPIFY_APP_URL,
 * SHOPIFY_API_VERSION. Lazy so the app can load dotenv in any import order.
 */
export function getShopify(): ShopifyInstance {
  _shopify ??= shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY ?? "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
    scopes: process.env.SHOPIFY_API_SCOPES?.split(",") ?? [],
    hostName: (process.env.SHOPIFY_APP_URL ?? "").replace(/https?:\/\//, ""),
    apiVersion: (process.env.SHOPIFY_API_VERSION as ApiVersion | undefined) ?? LATEST_API_VERSION,
    isEmbeddedApp: true,
    future: {
      lineItemBilling: true,
      customerAddressDefaultFix: true,
      unstable_managedPricingSupport: true,
    },
  });
  return _shopify;
}

/** Replace the default client (e.g. custom config or tests). Call before first use. */
export function setShopify(instance: ShopifyInstance): void {
  _shopify = instance;
}

export async function exchangeToken({
  idToken,
  shop,
  online,
}: {
  idToken: string;
  shop: string;
  online: boolean;
}): Promise<ShopifySession> {
  const { session } = await getShopify().auth.tokenExchange({
    requestedTokenType: online ? RequestedTokenType.OnlineAccessToken : RequestedTokenType.OfflineAccessToken,
    shop,
    sessionToken: idToken,
  });

  await saveShopifySession(session, online);
  return session;
}

async function saveShopifySession(shopifySession: ShopifySession, online: boolean) {
  let shop = await getShopByDomain(shopifySession.shop);
  if (shop == null) {
    shop = await saveDbShop({ shopifyDomain: shopifySession.shop, isInstalled: true, scopes: shopifySession.scope ?? "" });
  } else {
    await saveDbShop({ shopifyDomain: shopifySession.shop, lastActiveAt: new Date() });
  }
  return await saveDbSession({ id: shopifySession.id, shopId: shop.id, sessionData: shopifySession.toObject(), isOnline: online });
}

function sessionToShopifySession(session: DbSession | null): ShopifySession | null {
  if (session == null) return null;
  const shopifySession = new ShopifySession(session.sessionData as SessionParams);
  shopifySession.expires = new Date(shopifySession.expires ?? 0);
  return shopifySession;
}

function validateSession(session: ShopifySession | null, isOnline: boolean): ShopifySession | null {
  if (session == null) return null;
  if (isOnline && session.isExpired()) return null;
  return session;
}

export async function getSessionById(id: string, isOnline: boolean): Promise<ShopifySession | null> {
  const session = sessionToShopifySession(await getDbSessionById(id, isOnline));
  return validateSession(session, isOnline);
}

export async function getSessionByShopDomain(shopDomain: string, preferOnline: boolean): Promise<ShopifySession | null> {
  const session = sessionToShopifySession(await getDbSessionByShop(shopDomain, preferOnline));
  return validateSession(session, preferOnline);
}
