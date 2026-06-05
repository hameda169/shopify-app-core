import "reflect-metadata";

// Entities
export { Shop, Session, Subscription, UserSettings, coreEntities } from "./entities/index.js";

// Database
export { createCoreDataSource, type CreateCoreDataSourceOptions } from "./db/createDataSource.js";
export { getDataSource, setDataSource } from "./db/registry.js";

// Shopify client + session helpers
export {
  exchangeToken,
  getSessionById as getShopifySessionById,
  getSessionByShopDomain,
  getShopify,
  setShopify,
  type ShopifyInstance,
} from "./lib/shopify.js";

// Services
export {
  deleteSession,
  getSessionById,
  getSessionByShop,
  getShopByDomain,
  markShopAsUninstalled,
  saveSession,
  saveShop,
} from "./services/shopService.js";

// Middleware
export { apiAuth } from "./middleware/apiAuth.js";
export { webhookAuth } from "./middleware/webhookAuth.js";

// Routers & app factory
export { createWebhookRouter } from "./routes/webhooks.js";
export { createCoreApiRoutes } from "./routes/coreApi.js";
export { createApp, startApp, type CreateAppOptions, type StartAppOptions } from "./app.js";

// Utils & types
export { parseAndNormalizeSettings } from "./utils/themeSettings.js";
export type { ApiContext, WebhookContext } from "./types.js";
