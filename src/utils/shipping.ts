import { addDays, format } from "date-fns";
import type { Pence, ShippingMethod, Vendor } from "../types/marketplace";

export interface ShippingOption {
  method: ShippingMethod;
  pricePence: Pence;
  freeApplied: boolean;
  eligible: boolean;
  reason?: string;
  estimate: string;
  dispatchBy: string;
}

export function postcodeArea(postcode: string): string {
  return postcode.trim().toUpperCase().match(/^[A-Z]{1,2}/)?.[0] ?? "";
}

export function postcodeDistrict(postcode: string): string {
  return postcode.trim().toUpperCase().split(/\s+/)[0] ?? "";
}

export function isValidUkPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode.trim());
}

function nextDispatchDate(method: ShippingMethod, now: Date): Date {
  const [h, m] = method.cutoff.split(":").map(Number);
  let d = new Date(now);
  const pastCutoff = now.getHours() > h || now.getHours() === h && now.getMinutes() >= m;
  if (pastCutoff) d = addDays(d, 1);
  let remaining = method.processingDays;
  // Find first dispatch day, then count processing days on dispatch days only.
  for (let guard = 0; guard < 30; guard++) {
    if (method.dispatchDays.includes(d.getDay())) {
      if (remaining === 0) return d;
      remaining -= 1;
    }
    d = addDays(d, 1);
  }
  return d;
}

/** Seller-specific shipping quote. In production this runs on the server against the seller's versioned shipping profile. */
export function quoteVendorShipping(vendor: Vendor, merchandisePence: Pence, postcode: string, now = new Date()): ShippingOption[] {
  const area = postcodeArea(postcode);
  const { shipping } = vendor;
  return shipping.methods.
  filter((m) => m.enabled).
  map((method) => {
    const dispatch = nextDispatchDate(method, now);
    let eligible = true;
    let reason: string | undefined;
    if (!area) {
      eligible = false;
      reason = "Enter a delivery postcode";
    } else if (shipping.excludedAreas.includes(area)) {
      eligible = false;
      reason = `${vendor.name} doesn't ship to ${area} postcodes`;
    } else if (method.coverage !== "UK" && !method.coverage.includes(area)) {
      eligible = false;
      reason = method.type === "collection" ? "Collection only for local customers" : `Not available to ${area} postcodes`;
    } else if (merchandisePence < shipping.minOrderPence) {
      eligible = false;
      reason = `Minimum order £${(shipping.minOrderPence / 100).toFixed(2)}`;
    }
    const freeApplied =
    method.type === "standard" && shipping.freeThresholdPence !== null && merchandisePence >= shipping.freeThresholdPence;
    const estimate =
    method.type === "collection" ?
    `Ready to collect ${format(dispatch, "EEE d MMM")}` :
    method.deliveryMinDays === method.deliveryMaxDays ?
    `Arrives ${format(addDays(dispatch, method.deliveryMinDays), "EEE d MMM")}` :
    `Arrives ${format(addDays(dispatch, method.deliveryMinDays), "EEE d MMM")} – ${format(addDays(dispatch, method.deliveryMaxDays), "EEE d MMM")}`;
    return {
      method,
      pricePence: freeApplied ? 0 : method.pricePence,
      freeApplied,
      eligible,
      reason,
      estimate,
      dispatchBy: `Order by ${method.cutoff} to dispatch ${format(dispatch, "EEE d MMM")}`
    };
  });
}