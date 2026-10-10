import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { usePlatform } from "../../contexts/PlatformContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../dashboard/StatusPill";
import { DisputeDialog } from "./DisputeDialog";
import type { FulfilmentStatus } from "../../types/marketplace";

export const fulfilmentLabel: Record<FulfilmentStatus, {label: string;tone: "gold" | "navy" | "green" | "red";}> = {
  awaiting_fulfilment: { label: "Awaiting seller", tone: "gold" },
  processing: { label: "Processing", tone: "navy" },
  dispatched: { label: "Dispatched", tone: "navy" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" }
};

export function OrdersTab() {
  const { user, userIdForVendor } = useAuth();
  const { orders, vendors } = usePlatform();
  const { settlements, statusOf } = useFinance();
  const [dispute, setDispute] = useState<{ref: string;vendorId: string;} | null>(null);
  const mine = orders.filter((o) => o.customerId === user?.id);

  if (mine.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-line">
        <p className="font-semibold text-navy">No orders yet</p>
        <Link to="/c/african-foods" className="mt-3 inline-block text-sm font-semibold text-navy underline">Shop African Foods</Link>
      </div>);

  }

  return (
    <>
      <ul className="mt-6 space-y-4">
        {mine.map((o) =>
        <li key={o.id} className="bg-white rounded-2xl border border-line">
            <div className="flex flex-wrap justify-between gap-2 px-5 py-4 border-b border-line">
              <div>
                <Link to={`/order/${o.id}`} className="font-semibold text-ink hover:text-navy">{o.id}</Link>
                <p className="text-sm text-muted">{format(new Date(o.createdAt), "d MMM yyyy")} · to {o.postcode}</p>
              </div>
              <p className="font-bold text-navy">{formatPence(o.totalPence)}</p>
            </div>
            <ul className="divide-y divide-line">
              {o.groups.map((g) => {
              const v = vendors.find((x) => x.id === g.vendorId);
              const s = settlements.find((x) => x.sourceRef === o.id && x.vendorId === g.vendorId);
              const sStatus = s ? statusOf(s) : null;
              return (
                <li key={g.vendorId} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{v?.name}</p>
                      <p className="text-xs text-muted">
                        {g.methodName}
                        {g.trackingRef ? ` · ${g.carrier ?? "Tracking"} ${g.trackingRef}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sStatus === "disputed" ? <StatusPill tone="red">Problem under review</StatusPill> : <StatusPill tone={fulfilmentLabel[g.status].tone}>{fulfilmentLabel[g.status].label}</StatusPill>}
                      {sStatus === "dispute_window" &&
                    <button onClick={() => setDispute({ ref: o.id, vendorId: g.vendorId })} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy hover:border-navy/40">Report a problem</button>
                    }
                    </div>
                  </li>);

            })}
            </ul>
          </li>
        )}
      </ul>
      <DisputeDialog open={!!dispute} sourceRef={dispute?.ref ?? ""} customerId={user?.id ?? ""} vendorId={dispute?.vendorId} vendorUserId={dispute ? userIdForVendor(dispute.vendorId) : undefined} onClose={() => setDispute(null)} />
    </>);

}