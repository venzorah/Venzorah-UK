import React, { useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { usePlatform } from "../../contexts/PlatformContext";
import { formatPence, parsePoundsToPence } from "../../utils/money";
import { StatusPill } from "../../components/dashboard/StatusPill";
import type { Plan } from "../../types/marketplace";

export function AdminPlans() {
  const { plans } = usePlatform();
  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Plans & pricing</h1>
      <p className="mt-1 text-muted max-w-3xl">
        Price changes apply to new subscribers from the effective date. Existing subscribers keep their current price until they've been notified and accepted the new terms, and changes sync to Stripe Billing before taking effect.
      </p>
      <div className="mt-6 space-y-6">
        {plans.map((p) => <PlanEditor key={p.id} plan={p} />)}
      </div>
    </div>);

}

function PlanEditor({ plan }: {plan: Plan;}) {
  const { schedulePlanPrice, updatePlanCommission } = usePlatform();
  const live = plan.prices.find((v) => v.status === "live")!;
  const scheduled = plan.prices.find((v) => v.status === "scheduled");
  const [monthly, setMonthly] = useState((live.monthlyPence / 100).toFixed(2));
  const [annual, setAnnual] = useState((live.annualPence / 100).toFixed(2));
  const [effective, setEffective] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");
  const [rates, setRates] = useState({ product: plan.productCommissionBps / 100, logistics: plan.logisticsCommissionBps / 100 });
  const isServices = plan.audience === "services";
  const includesLogistics = plan.includesLogistics;

  const submitPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parsePoundsToPence(monthly);
    const a = parsePoundsToPence(annual);
    if (m === null || a === null) return toast.error("Enter prices like 39.00");
    if (!reason.trim()) return toast.error("A reason is required for the audit trail");
    if (m === live.monthlyPence && a === live.annualPence) return toast.error("Prices are unchanged");
    schedulePlanPrice(plan.id, m, a, effective, reason.trim());
    setReason("");
    toast.success(`${plan.name} price change saved for ${effective}`);
  };

  const submitRates = () => {
    const valid = [rates.product, rates.logistics].every((r) => r >= 0 && r <= 30);
    if (!valid) return toast.error("Commission must be between 0% and 30%");
    updatePlanCommission(
      plan.id,
      { productCommissionBps: Math.round(rates.product * 100), logisticsCommissionBps: Math.round(rates.logistics * 100), includesLogistics },
      "Updated from plans screen"
    );
    toast.success("Commission rules saved. Completed transactions keep their original rate.");
  };

  return (
    <section className="bg-white rounded-2xl border border-line" aria-labelledby={`plan-${plan.id}`}>
      <header className="px-5 lg:px-6 py-5 border-b border-line flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`plan-${plan.id}`} className="text-xl font-extrabold text-navy">{plan.name}</h2>
            <StatusPill tone="green">Active</StatusPill>
            <StatusPill tone="navy">{isServices ? "Service providers" : "Product sellers"}</StatusPill>
          </div>
          <p className="text-sm text-muted">{plan.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-navy">{formatPence(live.monthlyPence)}<span className="text-sm font-medium text-muted">/mo</span></p>
          <p className="text-sm text-muted">{formatPence(live.annualPence)}/yr · {plan.subscribers} subscribers</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-line">
        <form onSubmit={submitPrice} className="p-5 lg:p-6" aria-label={`Change ${plan.name} price`}>
          <h3 className="font-bold text-ink">Schedule a price change</h3>
          {scheduled && <p className="mt-2 rounded-lg bg-gold-50 text-navy text-sm px-3 py-2">Scheduled: {formatPence(scheduled.monthlyPence)}/mo from {scheduled.effectiveFrom}. Saving another change replaces it.</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-semibold text-muted">Monthly (£)</span><input value={monthly} onChange={(e) => setMonthly(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted">Annual (£)</span><input value={annual} onChange={(e) => setAnnual(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted">Effective from</span><input type="date" value={effective} min={format(new Date(), "yyyy-MM-dd")} onChange={(e) => setEffective(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted">Reason</span><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required" className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
          </div>
          <button className="mt-4 h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Save price change</button>
        </form>

        {isServices ?
        <div className="p-5 lg:p-6">
            <h3 className="font-bold text-ink">Subscription only</h3>
            <p className="mt-2 text-sm text-ink/80">Salon, barbering, massage and spa providers pay this subscription and keep 100% of every booking. No commission is charged on services.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              {plan.features.map((f) => <li key={f}>· {f}</li>)}
            </ul>
          </div> :

        <div className="p-5 lg:p-6">
            <h3 className="font-bold text-ink">Product commission</h3>
            <label className="mt-4 block max-w-[180px]">
              <span className="text-xs font-semibold text-muted">Product sales (%)</span>
              <input type="number" step="0.5" min={0} max={30} value={rates.product} onChange={(e) => setRates({ ...rates, product: Number(e.target.value) })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" />
            </label>
            <p className="mt-2 text-xs text-muted">Product commission is calculated on merchandise value only, never shipping. Services are subscription-only.</p>
            <button onClick={submitRates} className="mt-4 h-10 px-4 rounded-lg border border-line text-sm font-semibold text-navy">Save commission rules</button>
          </div>
        }
      </div>

      <div className="border-t border-line overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="text-left px-5 lg:px-6 pt-4 pb-2 font-bold text-ink">Price history</caption>
          <thead className="text-left text-muted">
            <tr><th className="px-5 lg:px-6 py-2 font-medium">Effective</th><th className="px-3 py-2 font-medium">Monthly</th><th className="px-3 py-2 font-medium">Annual</th><th className="px-3 py-2 font-medium">Changed by</th><th className="px-3 py-2 font-medium">Reason</th><th className="px-5 lg:px-6 py-2 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {plan.prices.map((v) =>
            <tr key={v.id}>
                <td className="px-5 lg:px-6 py-2.5">{v.effectiveFrom}</td>
                <td className="px-3 py-2.5 font-semibold">{formatPence(v.monthlyPence)}</td>
                <td className="px-3 py-2.5">{formatPence(v.annualPence)}</td>
                <td className="px-3 py-2.5 text-muted">{v.changedBy}</td>
                <td className="px-3 py-2.5 text-muted">{v.reason}</td>
                <td className="px-5 lg:px-6 py-2.5"><StatusPill tone={v.status === "live" ? "green" : v.status === "scheduled" ? "gold" : "grey"}>{v.status}</StatusPill></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>);

}