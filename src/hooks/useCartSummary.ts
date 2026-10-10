import { useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { usePlatform } from "../contexts/PlatformContext";
import { quoteVendorShipping, type ShippingOption } from "../utils/shipping";
import { commissionPence } from "../utils/money";
import { planForVendor } from "../utils/plans";
import type { Product, ProductVariant, Vendor } from "../types/marketplace";

export interface CartGroupLine {
  product: Product;
  variant: ProductVariant;
  qty: number;
  linePence: number;
}

export interface CartGroup {
  vendor: Vendor;
  lines: CartGroupLine[];
  merchandisePence: number;
  options: ShippingOption[];
  selected: ShippingOption | undefined;
  commissionBps: number;
  commissionPence: number;
}

export function useCartSummary() {
  const { lines, postcode, selectedMethods } = useCart();
  const { products, vendors, plans, categories } = usePlatform();

  return useMemo(() => {
    const published = new Set(categories.filter((c) => c.status === "published").map((c) => c.id));
    const byVendor = new Map<string, CartGroupLine[]>();
    const unavailable: string[] = [];
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || !variant || product.moderation !== "approved" || !published.has(product.categoryId) || variant.stock === 0) {
        if (product) unavailable.push(product.name);
        continue;
      }
      const qty = Math.min(line.qty, variant.stock);
      const arr = byVendor.get(product.vendorId) ?? [];
      arr.push({ product, variant, qty, linePence: variant.pricePence * qty });
      byVendor.set(product.vendorId, arr);
    }
    const groups: CartGroup[] = [];
    byVendor.forEach((groupLines, vendorId) => {
      const vendor = vendors.find((v) => v.id === vendorId);
      if (!vendor) return;
      const merchandisePence = groupLines.reduce((s, l) => s + l.linePence, 0);
      const options = quoteVendorShipping(vendor, merchandisePence, postcode);
      const chosenId = selectedMethods[vendorId];
      const selected = options.find((o) => o.method.id === chosenId && o.eligible) ?? options.find((o) => o.eligible);
      const plan = planForVendor(vendor, plans);
      const bps = plan?.productCommissionBps ?? 500;
      groups.push({ vendor, lines: groupLines, merchandisePence, options, selected, commissionBps: bps, commissionPence: commissionPence(merchandisePence, bps) });
    });
    const merchandise = groups.reduce((s, g) => s + g.merchandisePence, 0);
    const shipping = groups.reduce((s, g) => s + (g.selected?.pricePence ?? 0), 0);
    const allShippable = groups.length > 0 && groups.every((g) => g.selected);
    return { groups, merchandise, shipping, total: merchandise + shipping, allShippable, unavailable, postcode };
  }, [lines, postcode, selectedMethods, products, vendors, plans, categories]);
}