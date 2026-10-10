import type { Plan, Vendor } from "../types/marketplace";

const planIdFor: Record<Vendor["plan"], string> = {
  free: "plan-free",
  premium: "plan-premium",
  services: "plan-services"
};

export function planForVendor(vendor: Vendor, plans: Plan[]): Plan | undefined {
  return plans.find((p) => p.id === planIdFor[vendor.plan]);
}

export function livePrice(plan: Plan) {
  return plan.prices.find((v) => v.status === "live") ?? plan.prices[0];
}

/**
 * Salon, barbering, massage and spa providers pay a subscription only — bookings carry 0% commission.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function bookingCommissionBps(_categoryKind: "product" | "service" | "logistics", _plan: Plan | undefined): number {
  return 0;
}