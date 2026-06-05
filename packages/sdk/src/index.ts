export type { CollectEventPayload, DeviceType } from "@hameda169/shopify-core-shared";
export { detectDevice, escapeRegExp, fetchConfig, findProductForm, highlight, postEvent, uuidv4 } from "./utils.js";
import "./types.js"; // global Window augmentation (Shopify, ShopifyAnalytics)
