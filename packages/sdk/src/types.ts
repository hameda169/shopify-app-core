export type { CollectEventPayload, DeviceType } from "@hameda169/shopify-core-shared";

declare global {
  interface Window {
    ShopifyAnalytics?: {
      meta?: {
        product?: { variants: { id?: number; name?: string; public_title?: string }[]; id?: number };
        page: {
          pageType?: "home" | "product" | "collection" | "search" | "cart" | "checkout";
        };
      };
    };
    Shopify?: { shop?: string };
  }
}
