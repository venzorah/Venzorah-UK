import React from "react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";

const moderationTone = { approved: "green", pending: "gold", rejected: "red" } as const;
const moderationLabel = { approved: "Live", pending: "In review", rejected: "Changes needed" } as const;

export function VendorProducts() {
  const { products } = usePlatform();
  const { vendor } = useCurrentVendor();
  const mine = products.filter((p) => p.vendorId === vendor?.id);

  if (mine.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Products</h1>
        <div className="mt-6 bg-white rounded-2xl border border-line p-10 text-center">
          <p className="font-semibold text-navy">No listings yet</p>
          <p className="mt-1 text-sm text-muted">Your first listings will appear here once submitted for moderation.</p>
        </div>
      </div>);

  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Products</h1>
      <p className="mt-1 text-muted">Food listings go live only after moderation checks ingredients, allergens and storage information.</p>
      <div className="mt-6 bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted border-b border-line">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Variant</th>
              <th className="px-5 py-3 font-medium text-right">Price</th>
              <th className="px-5 py-3 font-medium text-right">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {mine.flatMap((p) =>
            p.variants.map((v, i) =>
            <tr key={v.id}>
                  <td className="px-5 py-3">
                    {i === 0 &&
                <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-semibold text-ink">{p.name}</span>
                      </div>
                }
                  </td>
                  <td className="px-5 py-3 text-ink">{v.label}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPence(v.pricePence)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${v.stock <= 5 ? "text-danger" : "text-ink"}`}>{v.stock}</td>
                  <td className="px-5 py-3">{i === 0 && <StatusPill tone={moderationTone[p.moderation]}>{moderationLabel[p.moderation]}</StatusPill>}</td>
                </tr>
            )
            )}
          </tbody>
        </table>
      </div>
    </div>);

}