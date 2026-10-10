import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePlatform } from "../../contexts/PlatformContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { fulfilmentLabel } from "../../components/account/OrdersTab";
import type { Order, OrderGroup } from "../../types/marketplace";

export function VendorOrders() {
  const { orders, products, updateOrderGroup } = usePlatform();
  const { recordMilestone } = useFinance();
  const { notify } = useEngagement();
  const { vendor } = useCurrentVendor();
  const [tracking, setTracking] = useState<Record<string, {carrier: string;ref: string;}>>({});
  if (!vendor) return null;

  const rows = orders.flatMap((o) => o.groups.filter((g) => g.vendorId === vendor.id).map((g) => ({ order: o, group: g })));

  const advance = (order: Order, group: OrderGroup) => {
    if (group.status === "awaiting_fulfilment") {
      updateOrderGroup(order.id, vendor.id, { status: "processing" });
      notify(order.customerId, `${vendor.name} is preparing ${order.id}`, "We'll let you know when it's dispatched.", "/account");
    } else if (group.status === "processing") {
      const t = tracking[order.id];
      if (group.methodType !== "collection" && (!t?.carrier.trim() || !t?.ref.trim())) return toast.error("Add carrier and tracking reference before dispatching");
      updateOrderGroup(order.id, vendor.id, { status: "dispatched", carrier: t?.carrier, trackingRef: t?.ref, dispatchedAt: new Date().toISOString() });
      notify(order.customerId, `${order.id} has been dispatched`, t ? `${t.carrier} · ${t.ref}` : "Ready for collection.", "/account");
    } else if (group.status === "dispatched") {
      updateOrderGroup(order.id, vendor.id, { status: "delivered", deliveredAt: new Date().toISOString() });
      const gross = group.merchandisePence + group.shippingPence;
      recordMilestone({ vendorId: vendor.id, source: "order", sourceRef: order.id, customerId: order.customerId, grossPence: gross, commissionPence: group.commissionPence, netPence: gross - group.commissionPence, milestone: "Delivered (seller-reported)" });
      notify(order.customerId, `${order.id} marked as delivered`, "Something wrong? You can report a problem for 7 days.", "/account");
      toast.success("Marked delivered. 7-day settlement window started.");
    }
  };

  const nextLabel: Partial<Record<OrderGroup["status"], string>> = { awaiting_fulfilment: "Start processing", processing: "Mark dispatched", dispatched: "Mark delivered" };

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Orders</h1>
      <p className="mt-1 text-muted">You ship your own orders. Delivery terms shown are locked from checkout.</p>
      {rows.length === 0 ?
      <div className="mt-6 bg-white rounded-2xl border border-line p-10 text-center"><p className="font-semibold text-navy">No orders yet</p></div> :

      <ul className="mt-6 space-y-4">
          {rows.map(({ order, group }) =>
        <li key={order.id} className="bg-white rounded-2xl border border-line">
              <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{order.id}</p>
                  <p className="text-sm text-muted">{format(new Date(order.createdAt), "d MMM, HH:mm")} · {group.methodName} to {order.postcode} · {group.estimate}</p>
                </div>
                <StatusPill tone={fulfilmentLabel[group.status].tone}>{fulfilmentLabel[group.status].label}</StatusPill>
              </div>
              <div className="px-5 py-4 grid md:grid-cols-[1fr_auto] gap-4">
                <ul className="text-sm space-y-1">
                  {group.lines.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                const v = p?.variants.find((x) => x.id === l.variantId);
                return <li key={l.variantId} className="flex justify-between gap-4"><span>{l.qty} × {p?.name} ({v?.label})</span><span className="text-muted">{formatPence(l.unitPence * l.qty)}</span></li>;
              })}
                  <li className="flex justify-between gap-4 pt-1 text-muted"><span>Shipping (excluded from commission)</span><span>{formatPence(group.shippingPence)}</span></li>
                  <li className="flex justify-between gap-4 text-muted"><span>Commission {group.commissionBps / 100}%</span><span>−{formatPence(group.commissionPence)}</span></li>
                  {group.trackingRef && <li className="pt-1 text-ink">{group.carrier} · {group.trackingRef}</li>}
                </ul>
                <div className="md:w-72 space-y-2">
                  {group.status === "processing" && group.methodType !== "collection" &&
              <div className="grid grid-cols-2 gap-2">
                      <input aria-label="Carrier" placeholder="Carrier" value={tracking[order.id]?.carrier ?? ""} onChange={(e) => setTracking({ ...tracking, [order.id]: { carrier: e.target.value, ref: tracking[order.id]?.ref ?? "" } })} className="h-10 rounded-lg border border-line px-3 text-sm" />
                      <input aria-label="Tracking reference" placeholder="Tracking ref" value={tracking[order.id]?.ref ?? ""} onChange={(e) => setTracking({ ...tracking, [order.id]: { ref: e.target.value, carrier: tracking[order.id]?.carrier ?? "" } })} className="h-10 rounded-lg border border-line px-3 text-sm" />
                    </div>
              }
                  {nextLabel[group.status] && <button onClick={() => advance(order, group)} className="w-full h-10 rounded-lg bg-navy text-white text-sm font-semibold">{nextLabel[group.status]}</button>}
                  {group.status === "dispatched" && <p className="text-xs text-muted">Seller-reported delivery is labelled as such to the customer.</p>}
                </div>
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}