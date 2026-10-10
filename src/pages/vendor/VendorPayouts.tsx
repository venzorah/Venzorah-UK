import React from "react";
import { format } from "date-fns";
import { useFinance } from "../../contexts/FinanceContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { SettlementStatusPill } from "../../components/finance/SettlementStatusPill";

export function VendorPayouts() {
  const { settlements, payouts, disputes, statusOf } = useFinance();
  const { vendor } = useCurrentVendor();
  if (!vendor) return null;
  const mine = settlements.filter((s) => s.vendorId === vendor.id);
  const sum = (statuses: string[]) => mine.filter((s) => statuses.includes(statusOf(s))).reduce((n, s) => n + s.netPence, 0);
  const myPayouts = payouts.filter((p) => p.vendorId === vendor.id);
  const myDisputes = disputes.filter((d) => mine.some((s) => s.id === d.settlementId));

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Settlements & payouts</h1>
      <p className="mt-1 text-muted max-w-3xl">Funds become eligible 7 days after a delivery or service-completion milestone if no problem is raised. Payouts are sent by the payment provider to your connected bank account.</p>

      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 pb-6 border-b border-line">
        <div><dt className="text-xs text-muted">In dispute window</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(sum(["dispute_window"]))}</dd></div>
        <div><dt className="text-xs text-muted">Eligible / processing</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(sum(["eligible", "payout_processing"]))}</dd></div>
        <div><dt className="text-xs text-muted">On hold</dt><dd className="text-2xl font-extrabold text-danger">{formatPence(sum(["disputed"]))}</dd></div>
        <div><dt className="text-xs text-muted">Paid out</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(sum(["paid"]))}</dd></div>
      </dl>

      {myDisputes.filter((d) => d.status === "open").length > 0 &&
      <section className="mt-6 bg-red-50 rounded-2xl p-5" aria-labelledby="disp">
          <h2 id="disp" className="font-bold text-danger">Open disputes</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink">
            {myDisputes.filter((d) => d.status === "open").map((d) => <li key={d.id}><span className="font-semibold">{d.sourceRef}</span> · {d.reason} — “{d.details}”</li>)}
          </ul>
          <p className="mt-2 text-xs text-muted">VenZorah support will contact you for evidence before deciding.</p>
        </section>
      }

      <div className="mt-6 bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="text-left px-5 pt-4 pb-2 font-bold text-navy">Settlements</caption>
          <thead className="text-left text-muted border-b border-line">
            <tr><th className="px-5 py-2 font-medium">Reference</th><th className="px-3 py-2 font-medium">Milestone</th><th className="px-3 py-2 font-medium">Eligible from</th><th className="px-3 py-2 font-medium text-right">Gross</th><th className="px-3 py-2 font-medium text-right">Commission</th><th className="px-3 py-2 font-medium text-right">Net</th><th className="px-5 py-2 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {mine.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No settlements yet.</td></tr>}
            {mine.map((s) =>
            <tr key={s.id}>
                <td className="px-5 py-3 font-semibold text-ink">{s.sourceRef}</td>
                <td className="px-3 py-3 text-muted">{s.milestone} · {format(new Date(s.milestoneAt), "d MMM")}</td>
                <td className="px-3 py-3">{format(new Date(s.eligibleAt), "d MMM")}</td>
                <td className="px-3 py-3 text-right">{formatPence(s.grossPence)}</td>
                <td className="px-3 py-3 text-right text-muted">−{formatPence(s.commissionPence)}</td>
                <td className="px-3 py-3 text-right font-semibold">{formatPence(s.netPence)}</td>
                <td className="px-5 py-3"><SettlementStatusPill status={statusOf(s)} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-line">
        <h2 className="px-5 pt-4 pb-2 font-bold text-navy">Payouts</h2>
        {myPayouts.length === 0 ? <p className="px-5 pb-5 text-sm text-muted">No payouts yet.</p> :
        <ul className="divide-y divide-line">
            {myPayouts.map((p) =>
          <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                <span><span className="font-semibold text-ink">{p.id}</span> · {format(new Date(p.createdAt), "d MMM yyyy")} · {p.settlementIds.length} settlement(s)</span>
                <span className="flex items-center gap-3"><span className="font-bold text-navy">{formatPence(p.amountPence)}</span><StatusPill tone={p.status === "paid" ? "green" : p.status === "failed" ? "red" : "navy"}>{p.status}</StatusPill></span>
              </li>
          )}
          </ul>
        }
      </div>
    </div>);

}