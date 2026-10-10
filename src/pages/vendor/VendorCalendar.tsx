import React, { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { AlertTriangleIcon, PauseIcon, PlayIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence, commissionPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { bookingCommissionBps, planForVendor } from "../../utils/plans";
import type { Booking } from "../../types/marketplace";

const tone = { confirmed: "navy", pending_confirmation: "gold", completed: "green", no_show: "red", cancelled: "grey" } as const;

export function VendorCalendar() {
  const { services, bookings, blockedDates, plans, toggleServicePaused, toggleBlockedDate, updateBookingStatus } = usePlatform();
  const { recordMilestone } = useFinance();
  const { notify } = useEngagement();
  const { vendor, user, category } = useCurrentVendor();
  const [day, setDay] = useState(() => new Date());
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 2)), []);
  if (!vendor) return null;

  const mine = services.filter((s) => s.vendorId === vendor.id);
  const ids = new Set(mine.map((s) => s.id));
  const vendorBookings = bookings.filter((b) => ids.has(b.serviceId));
  const dayBookings = vendorBookings.filter((b) => isSameDay(new Date(b.start), day)).sort((a, b) => a.start.localeCompare(b.start));
  const dayKey = format(day, "yyyy-MM-dd");
  const blockedFor = mine.filter((s) => (blockedDates[s.id] ?? []).includes(dayKey));
  const dayBlocked = mine.length > 0 && blockedFor.length === mine.length;
  const activeOnDay = dayBookings.filter((b) => b.status === "confirmed").length;
  const plan = planForVendor(vendor, plans);

  const complete = (b: Booking) => {
    updateBookingStatus(b.id, "completed", vendor.name);
    const bps = bookingCommissionBps(category?.kind ?? "service", plan);
    const fee = commissionPence(b.totalPence, bps);
    recordMilestone({ vendorId: vendor.id, source: "booking", sourceRef: b.id, customerId: b.customerId, grossPence: b.totalPence, commissionPence: fee, netPence: b.totalPence - fee, milestone: "Service completed" });
    notify(b.customerId, "How was your appointment?", `${b.id} is marked complete. Report a problem within 7 days if anything went wrong.`, "/account?tab=bookings");
    toast.success("Completed. 7-day settlement window started.");
  };

  const cancel = (b: Booking) => {
    if (!window.confirm("Cancel this confirmed appointment? The customer will be notified and refunded in full.")) return;
    updateBookingStatus(b.id, "cancelled", vendor.name);
    notify(b.customerId, "Appointment cancelled by provider", `${vendor.name} cancelled ${b.id} (${format(new Date(b.start), "d MMM HH:mm")}). You'll receive a full refund.`, "/account?tab=bookings");
    toast("Appointment cancelled and customer notified");
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Calendar & availability</h1>
      <p className="mt-1 text-muted">Pausing or blocking a day stops new bookings. Confirmed appointments stay booked until you act on them.</p>

      <section className="mt-6 bg-white rounded-2xl border border-line divide-y divide-line" aria-label="Services">
        {mine.length === 0 && <p className="p-5 text-sm text-muted">No services yet.</p>}
        {mine.map((s) => {
          const future = vendorBookings.filter((b) => b.serviceId === s.id && b.status === "confirmed" && new Date(b.start) > new Date()).length;
          return (
            <div key={s.id} className="px-5 py-4 flex flex-wrap items-center gap-4 justify-between">
              <div>
                <p className="font-semibold text-ink">{s.name}</p>
                <p className="text-sm text-muted">{s.durationMin} min + {s.bufferMin} min buffer · {s.staff.join(", ")} · {future} upcoming</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={s.paused ? "gold" : "green"}>{s.paused ? "Paused" : "Taking bookings"}</StatusPill>
                <button
                  onClick={() => {
                    toggleServicePaused(s.id);
                    if (!s.paused && future > 0) notify(user?.id, `${s.name} paused`, `${future} confirmed appointment(s) are unaffected. Review them if you can't attend.`, "/vendor/calendar");
                    toast(s.paused ? "Bookings resumed" : `Paused. ${future} existing appointment(s) kept.`);
                  }}
                  className="h-9 px-3 rounded-lg border border-line text-sm font-semibold text-navy inline-flex items-center gap-1.5">
                  
                  {s.paused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}{s.paused ? "Resume" : "Pause"}
                </button>
              </div>
            </div>);

        })}
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Choose day">
        {days.map((d) => {
          const active = isSameDay(d, day);
          const count = vendorBookings.filter((b) => b.status === "confirmed" && isSameDay(new Date(b.start), d)).length;
          const blocked = mine.length > 0 && mine.every((s) => (blockedDates[s.id] ?? []).includes(format(d, "yyyy-MM-dd")));
          return (
            <button key={d.toISOString()} role="tab" aria-selected={active} onClick={() => setDay(d)} className={`shrink-0 w-16 h-[72px] rounded-xl border flex flex-col items-center justify-center transition-colors duration-150 ${active ? "bg-navy border-navy text-white" : blocked ? "bg-surface border-dashed border-line text-muted" : "bg-white border-line text-ink hover:border-navy/40"}`}>
              <span className="text-[11px]">{format(d, "EEE")}</span>
              <span className="text-lg font-bold leading-none mt-0.5">{format(d, "d")}</span>
              <span className={`mt-1 text-[10px] font-semibold ${active ? "text-gold" : "text-muted"}`}>{blocked ? "Blocked" : count ? `${count} booked` : "—"}</span>
            </button>);

        })}
      </div>

      <section className="mt-4 bg-white rounded-2xl border border-line" aria-labelledby="day-title">
        <header className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <h2 id="day-title" className="font-bold text-navy">{format(day, "EEEE d MMMM")}</h2>
          {mine.length > 0 &&
          <button
            onClick={() => {
              mine.forEach((s) => {
                const isBlocked = (blockedDates[s.id] ?? []).includes(dayKey);
                if (isBlocked === dayBlocked) toggleBlockedDate(s.id, dayKey);
              });
              toast(dayBlocked ? "Day reopened for bookings" : `Day blocked for new bookings${activeOnDay ? `. ${activeOnDay} appointment(s) still need attention.` : ""}`);
            }}
            className="h-9 px-3 rounded-lg border border-line text-sm font-semibold text-navy">
            
              {dayBlocked ? "Unblock day" : "Block day for new bookings"}
            </button>
          }
        </header>
        {dayBlocked && activeOnDay > 0 &&
        <p className="mx-5 mt-4 flex gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy"><AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />{activeOnDay} confirmed appointment(s) on a blocked day. Attend, or cancel and the customer is refunded.</p>
        }
        {dayBookings.length === 0 ?
        <p className="px-5 py-10 text-center text-sm text-muted">No appointments.</p> :

        <ul className="divide-y divide-line">
            {dayBookings.map((b) => {
            const s = mine.find((x) => x.id === b.serviceId);
            const started = new Date(b.start) <= new Date();
            return (
              <li key={b.id} className="px-5 py-4 flex flex-wrap items-center gap-4">
                  <p className="w-14 text-lg font-extrabold text-navy">{format(new Date(b.start), "HH:mm")}</p>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-semibold text-ink">{s?.name}</p>
                    <p className="text-sm text-muted">{b.staff} · {b.location} · {b.id} · {formatPence(b.totalPence)}</p>
                  </div>
                  <StatusPill tone={tone[b.status]}>{b.status.replace("_", " ")}</StatusPill>
                  {b.status === "confirmed" &&
                <div className="flex gap-2">
                      <button disabled={!started} title={started ? undefined : "Available once the appointment has started"} onClick={() => complete(b)} className="h-8 px-3 rounded-lg bg-navy text-white text-xs font-semibold disabled:opacity-40">Complete</button>
                      <button disabled={!started} onClick={() => {updateBookingStatus(b.id, "no_show", vendor.name);toast("Marked as no-show");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold disabled:opacity-40">No-show</button>
                      <button onClick={() => cancel(b)} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-danger">Cancel</button>
                    </div>
                }
                </li>);

          })}
          </ul>
        }
      </section>
    </div>);

}