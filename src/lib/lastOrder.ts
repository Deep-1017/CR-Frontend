export const LAST_ORDER_STORAGE_KEY = "cr:last-order";

export interface LastOrderPricingSnapshot {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface LastOrderSnapshot {
  orderId: string;
  email: string;
  placedAt: string;
  pricing: LastOrderPricingSnapshot;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const readLastOrderSnapshot = (): LastOrderSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<LastOrderSnapshot> | null;
    if (!parsed || typeof parsed !== "object") return null;

    const orderId = typeof parsed.orderId === "string" ? parsed.orderId.trim() : "";
    const email = typeof parsed.email === "string" ? parsed.email.trim().toLowerCase() : "";
    const placedAt = typeof parsed.placedAt === "string" ? parsed.placedAt.trim() : "";
    const pricing = parsed.pricing;

    if (
      !orderId ||
      !email ||
      !placedAt ||
      !pricing ||
      typeof pricing !== "object" ||
      !isFiniteNumber(pricing.subtotal) ||
      !isFiniteNumber(pricing.tax) ||
      !isFiniteNumber(pricing.shipping) ||
      !isFiniteNumber(pricing.total)
    ) {
      return null;
    }

    return {
      orderId,
      email,
      placedAt,
      pricing: {
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        shipping: pricing.shipping,
        total: pricing.total,
      },
    };
  } catch {
    return null;
  }
};

export const saveLastOrderSnapshot = (snapshot: LastOrderSnapshot): void => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    LAST_ORDER_STORAGE_KEY,
    JSON.stringify({
      ...snapshot,
      email: snapshot.email.trim().toLowerCase(),
    })
  );
};
