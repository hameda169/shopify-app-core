/** Device classification used by the SDK (detection), backend (analytics events) and frontend (breakdowns). */
export type DeviceType = "mobile" | "desktop" | "tablet" | "unknown";

/** Billing plan names used by Shop/Subscription entities and the pricing UI. */
export type PlanName = "Basic" | "Pro" | "Business";

/** Subscription lifecycle states. */
export type SubscriptionStatus = "active" | "pending" | "cancelled" | "frozen" | "trialing";

/** Date ranges accepted by /api/analytics. */
export type DateRange = "last_7_days" | "last_30_days" | "last_3_months";

/** Response of GET /api/billing. */
export interface BillingInfo {
  currentPlan: PlanName;
}

/** Response of GET /api/check-app-embed. */
export interface EmbedStatus {
  isEnabled: boolean;
  editorUrl: string;
}

/**
 * Payload the storefront SDK POSTs to /public/collect. eventType values are
 * app-specific (e.g. "button_view" | "button_click" | ...); extra fields are
 * allowed.
 */
export interface CollectEventPayload {
  shop: string;
  eventId: string;
  eventType: string;
  productId?: string | null;
  productTitle?: string | null;
  device?: DeviceType;
  occurredAt?: string;
  clickId?: string | null;
  userAgent?: string | null;
  [key: string]: unknown;
}
