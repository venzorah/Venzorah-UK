import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useFinance } from "../../contexts/FinanceContext";
import { usePlatform } from "../../contexts/PlatformContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { formatPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { SettlementStatusPill } from "../../components/finance/SettlementStatusPill";

export function AdminFinance() {
  const { settlements, disputes, payouts, statusOf, resolveDispute, releaseEligible, confirmPayout, retrySettlement } = useFinance();
  const { vendors } = usePlatform();
  const { userIdForVendor } = useAuth();
  const { notify } = useEngagement();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;
  const eligible = settlements.filter((s) => statusOf(s) === "eligible");
  const openDisputes = disputes.filter((d) => d.status === "open");

  const resolve = (id: string, outcome: "refunded" | "released") => {
    const note = notes[id]?.trim();
    if (!note) return toast.error("Add a resolution note for the audit trail");
    const d = disputes.find((x) => x.id === id)!;
    const s = settlements.find((x) => x.id === d.settlementId)!;
    resolveDispute(id, outcome, note);
    notify(d.customerId, `Update on ${d.sourceRef}`, outcome === "refunded" ? `We've refunded you ${formatPence(s.grossPence)}. ${note}` : `We've reviewed your report and closed it. ${note}`, "/account");
    notify(userIdForVendor(s.vendorId), `Dispute on ${d.sourceRef} resolved`, outcome === "refunded" ? "The customer was refunded; this settlement won't be paid." : "Funds released back to your settlement schedule.", "/vendor/payouts");
    toast.success(outcome === "refunded" ? "Customer refunded" : "Funds released to seller schedule");
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Finance</h1>
      <p className="mt-1 text-muted max-w-3xl">Settlement eligibility is 7 days after a recorded delivery or completion. In production, holds and transfers run through the approved payment provider (e.g. Stripe Connect) and every action here is audited.</p>

      <section className="mt-6 bg-white rounded-2xl border border-line" aria-labelledby="disputes">
        <header className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 id="disputes" className="font-bold text-navy">Open disputes</h2>
          <span className="text-sm text-muted">{openDisputes.length}</span>
        </header>
        {openDisputes.length === 0 ? <p className="px-5 py-8 text-center text-sm text-muted">No open disputes.</p> :
        <ul className="divide-y divide-line">
            {openDisputes.map((d) => {
            const s = settlements.find((x) => x.id === d.settlementId);
            return (
              <li key={d.id} className="px-5 py-4 grid lg:grid-cols-[1fr_360px] gap-4">
                  <div>
                    <p className="font-semibold text-ink">{d.sourceRef} · {d.reason}</p>
                    <p className="text-sm text-muted">{s && vendorName(s.vendorId)} · {s && formatPence(s.grossPence)} · opened {format(new Date(d.openedAt), "d MMM HH:mm")}</p>
                    <p className="mt-2 text-sm text-ink">“{d.details}”</p>
                  </div>
                  <div className="space-y-2">
                    <input value={notes[d.id] ?? ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} placeholder="Resolution note (required)" aria-label="Resolution note" className="w-full h-10 rounded-lg border border-line px-3 text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => resolve(d.id, "refunded")} className="flex-1 h-9 rounded-lg bg-navy text-white text-sm font-semibold">Refund customer</button>
                      <button onClick={() => resolve(d.id, "released")} className="flex-1 h-9 rounded-lg border border-line text-sm font-semibold text-navy">Release to seller</button>
                    </div>
                  </div>
                </li>);

          })}
          </ul>
        }
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-line overflow-x-auto" aria-labelledby="settle">
        <header className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <h2 id="settle" className="font-bold text-navy">Settlements</h2>
          <button
            disabled={eligible.length === 0}
            onClick={() => {
              const created = releaseEligible();
              created.forEach((p) => notify(userIdForVendor(p.vendorId), "Payout on its way", `${formatPence(p.amountPence)} is being sent to your bank account (${p.id}).`, "/vendor/payouts"));
              toast.success(`${created.length} payout(s) created`);
            }}
            className="h-9 px-4 rounded-lg bg-gold text-navy text-sm font-bold disabled:bg-line disabled:text-muted">
            
            Release {eligible.length} eligible ({formatPence(eligible.reduce((n, s) => n + s.netPence, 0))})
          </button>
        </header>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-muted border-b border-line">
            <tr><th className="px-5 py-2 font-medium">Ref</th><th className="px-3 py-2 font-medium">Seller</th><th className="px-3 py-2 font-medium">Milestone</th><th className="px-3 py-2 font-medium">Eligible</th><th className="px-3 py-2 font-medium text-right">Net</th><th className="px-3 py-2 font-medium">Status</th><th className="px-5 py-2" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {settlements.map((s) => {
              const st = statusOf(s);
              return (
                <tr key={s.id}>
                  <td className="px-5 py-3 font-semibold text-ink">{s.sourceRef}</td>
                  <td className="px-3 py-3">{vendorName(s.vendorId)}</td>
                  <td className="px-3 py-3 text-muted">{s.milestone}, {format(new Date(s.milestoneAt), "d MMM")}</td>
                  <td className="px-3 py-3">{format(new Date(s.eligibleAt), "d MMM")}</td>
                  <td className="px-3 py-3 text-right font-semibold">{formatPence(s.netPence)}</td>
                  <td className="px-3 py-3"><SettlementStatusPill status={st} /></td>
                  <td className="px-5 py-3 text-right">{st === "failed" && <button onClick={() => {retrySettlement(s.id);toast("Returned to eligible queue");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy">Retry</button>}</td>
                </tr>);

            })}
          </tbody>
        </table>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-line" aria-labelledby="payouts">
        <h2 id="payouts" className="px-5 pt-4 pb-2 font-bold text-navy">Payouts</h2>
        <ul className="divide-y divide-line">
          {payouts.map((p) =>
          <li key={p.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span><span className="font-semibold text-ink">{p.id}</span> · {vendorName(p.vendorId)} · {format(new Date(p.createdAt), "d MMM")}</span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-navy">{formatPence(p.amountPence)}</span>
                <StatusPill tone={p.status === "paid" ? "green" : p.status === "failed" ? "red" : "navy"}>{p.status}</StatusPill>
                {p.status === "processing" &&
              <>
                    <button onClick={() => {confirmPayout(p.id, "paid");notify(userIdForVendor(p.vendorId), "Payout paid", `${formatPence(p.amountPence)} has arrived (${p.id}).`, "/vendor/payouts");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy">Provider confirmed</button>
                    <button onClick={() => {confirmPayout(p.id, "failed");notify("admin", `Payout ${p.id} failed`, "Retry from the settlements table once bank details are fixed.", "/admin/finance");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-danger">Mark failed</button>
                  </>
              }
              </span>
            </li>
          )}
        </ul>
      </section>
    </div>);

}