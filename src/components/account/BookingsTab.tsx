import React, { useState } from "react";
import { Link } from "react-router-dom";
import { differenceInHours, format } from "date-fns";
import { toast } from "sonner";
import { usePlatform } from "../../contexts/PlatformContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../dashboard/StatusPill";
import { DisputeDialog } from "./DisputeDialog";
import type { BookingStatus } from "../../types/marketplace";

const bookingTone: Record<BookingStatus, {label: string;tone: "gold" | "navy" | "green" | "red" | "grey";}> = {
  confirmed: { label: "Confirmed", tone: "navy" },
  pending_confirmation: { label: "Awaiting provider", tone: "gold" },
  completed: { label: "Completed", tone: "green" },
  no_show: { label: "No-show", tone: "red" },
  cancelled: { label: "Cancelled", tone: "grey" }
};

export function BookingsTab() {
  const { user, userIdForVendor } = useAuth();
  const { bookings, services, vendors, updateBookingStatus } = usePlatform();
  const { settlements, statusOf } = useFinance();
  const { notify } = useEngagement();
  const [dispute, setDispute] = useState<{ref: string;vendorId: string;} | null>(null);
  const mine = bookings.filter((b) => b.customerId === user?.id).sort((a, b) => b.start.localeCompare(a.start));

  if (mine.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-line">
        <p className="font-semibold text-navy">No bookings yet</p>
        <Link to="/browse?view=services" className="mt-3 inline-block text-sm font-semibold text-navy underline">Find a service</Link>
      </div>);

  }

  return (
    <>
      <ul className="mt-6 space-y-3">
        {mine.map((b) => {
          const s = services.find((x) => x.id === b.serviceId);
          const v = vendors.find((x) => x.id === s?.vendorId);
          const settlement = settlements.find((x) => x.sourceRef === b.id);
          const sStatus = settlement ? statusOf(settlement) : null;
          const upcoming = b.status === "confirmed" && new Date(b.start) > new Date();
          const hoursAway = differenceInHours(new Date(b.start), new Date());
          return (
            <li key={b.id} className="bg-white rounded-2xl border border-line p-5 flex flex-col sm:flex-row gap-4">
              <img src={s?.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-ink">{s?.name}</p>
                <p className="text-sm text-muted">{v?.name} · {format(new Date(b.start), "EEE d MMM, HH:mm")} · {b.staff}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {sStatus === "disputed" ? <StatusPill tone="red">Problem under review</StatusPill> : <StatusPill tone={bookingTone[b.status].tone}>{bookingTone[b.status].label}</StatusPill>}
                  {upcoming &&
                  <button
                    onClick={() => {
                      if (!window.confirm(`Cancel this booking? ${s?.cancellationPolicy ?? ""}`)) return;
                      updateBookingStatus(b.id, "cancelled", user?.name ?? "Customer");
                      notify(v ? userIdForVendor(v.id) : undefined, "Booking cancelled", `${b.id} on ${format(new Date(b.start), "d MMM HH:mm")} was cancelled by the customer.`, "/vendor/calendar");
                      toast.success(hoursAway >= 48 ? "Booking cancelled. Full refund on its way." : "Booking cancelled. Refund follows the provider's policy.");
                    }}
                    className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-danger">
                    
                      Cancel
                    </button>
                  }
                  {sStatus === "dispute_window" &&
                  <button onClick={() => v && setDispute({ ref: b.id, vendorId: v.id })} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy">Report a problem</button>
                  }
                </div>
              </div>
              <p className="font-bold text-navy">{formatPence(b.totalPence)}</p>
            </li>);

        })}
      </ul>
      <DisputeDialog open={!!dispute} sourceRef={dispute?.ref ?? ""} customerId={user?.id ?? ""} vendorId={dispute?.vendorId} vendorUserId={dispute ? userIdForVendor(dispute.vendorId) : undefined} onClose={() => setDispute(null)} />
    </>);

}