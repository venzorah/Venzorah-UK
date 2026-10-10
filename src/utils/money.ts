import type { Pence } from "../types/marketplace";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function formatPence(value: Pence): string {
  return gbp.format(value / 100);
}

/** Commission in integer pence using basis points; rounds half up. Never uses floats on money. */
export function commissionPence(basePence: Pence, bps: number): Pence {
  return Math.round(basePence * bps / 10000);
}

export function parsePoundsToPence(input: string): Pence | null {
  const trimmed = input.trim().replace(/^£/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}