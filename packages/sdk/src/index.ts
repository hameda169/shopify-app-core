// Re-export through ./types.js so its global Window augmentation
// (Shopify, ShopifyAnalytics) is retained in the emitted index.d.ts.
export type { CollectEventPayload, DeviceType } from "./types.js";
export { detectDevice, escapeRegExp, fetchConfig, findProductForm, highlight, postEvent, uuidv4 } from "./utils.js";
