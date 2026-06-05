import type { DeviceType } from "@hameda169/shopify-core-shared";

export function detectDevice(): DeviceType {
  const ua = navigator.userAgent || "";
  const isTablet = /iPad|Tablet|Nexus 7|Nexus 9/i.test(ua);
  const isMobile = /Mobi|Android(?!.*Tablet)/i.test(ua);
  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
}

export function uuidv4(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** POST an analytics event to /public/collect — sendBeacon first, fetch fallback. Never throws. */
export async function postEvent(baseUrl: string, payload: Record<string, unknown>): Promise<void> {
  const url = `${baseUrl}/public/collect`;
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    const ok = navigator.sendBeacon(url, blob);
    if (ok) return;
  } catch {}
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  } catch {}
}

/** Fetch the app's storefront config from /public/config. T is the app-specific config shape. */
export async function fetchConfig<T>(baseUrl: string, shop: string): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl}/public/config?shop=${encodeURIComponent(shop)}`, { credentials: "omit" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findProductForm(): HTMLElement | null {
  const primary = document.querySelector<HTMLElement>(".product-form");
  if (primary) return primary;
  const alt = document.querySelector<HTMLElement>('form[action*="/cart/add"]');
  if (alt) return alt;
  const dataForm = document.querySelector<HTMLElement>("form[data-product-form]");
  if (dataForm) return dataForm;
  const forms = Array.from(document.querySelectorAll("form"));
  for (const f of forms) {
    if (f.querySelector('[name="id"]')) return f as HTMLElement;
  }
  return null;
}

export function highlight(el: HTMLElement) {
  const prevOutline = el.style.outline;
  const prevTransition = el.style.transition;
  el.style.transition = "outline 0.2s ease-in-out";
  el.style.outline = "3px solid rgba(0, 128, 96, 0.6)";
  setTimeout(() => {
    el.style.outline = prevOutline;
    el.style.transition = prevTransition;
  }, 1200);
}
