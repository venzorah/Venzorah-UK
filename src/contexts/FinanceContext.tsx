import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { addDays } from "date-fns";
import { seedPayouts, seedSettlements } from "../data/finance";
import type { Dispute, Payout, Settlement, SettlementStatus } from "../types/marketplace";

type Result = {ok: true;} | {ok: false;error: string;};

interface FinanceState {
  settlements: Settlement[];
  disputes: Dispute[];
  payouts: Payout[];
  statusOf: (s: Settlement) => SettlementStatus;
  recordMilestone: (input: Omit<Settlement, "id" | "eligibleAt" | "status" | "milestoneAt">) => void;
  openDispute: (sourceRef: string, customerId: string, reason: string, details: string, vendorId?: string) => Result;
  resolveDispute: (id: string, outcome: "refunded" | "released", note: string) => void;
  releaseEligible: () => Payout[];
  confirmPayout: (id: string, outcome: "paid" | "failed") => void;
  retrySettlement: (settlementId: string) => void;
}

const FinanceContext = createContext<FinanceState | null>(null);

/** A 7-day window after a verified milestone, then eligible unless disputed. Mirrors server-side settlement rules. */
function effectiveStatus(s: Settlement, now = new Date()): SettlementStatus {
  if (s.status === "dispute_window" && new Date(s.eligibleAt) <= now) return "eligible";
  return s.status;
}

export function FinanceProvider({ children }: {children: React.ReactNode;}) {
  const [settlements, setSettlements] = usePersistentState<Settlement[]>("vz-settlements-v3", seedSettlements, "session");
  const [disputes, setDisputes] = usePersistentState<Dispute[]>("vz-disputes-v3", [], "session");
  const [payouts, setPayouts] = usePersistentState<Payout[]>("vz-payouts-v3", seedPayouts, "session");

  const value = useMemo<FinanceState>(
    () => ({
      settlements,
      disputes,
      payouts,
      statusOf: (s) => effectiveStatus(s),
      recordMilestone: (input) => {
        if (settlements.some((s) => s.sourceRef === input.sourceRef && s.vendorId === input.vendorId)) return;
        const now = new Date();
        setSettlements((ss) => [{ ...input, id: `ST-${905 + ss.length}`, milestoneAt: now.toISOString(), eligibleAt: addDays(now, 7).toISOString(), status: "dispute_window" }, ...ss]);
      },
      openDispute: (sourceRef, customerId, reason, details, vendorId) => {
        const s = settlements.find((x) => x.sourceRef === sourceRef && x.customerId === customerId && (!vendorId || x.vendorId === vendorId));
        if (!s) return { ok: false, error: "Problems can be reported once the order is delivered or the service is completed." };
        const status = effectiveStatus(s);
        if (status === "disputed") return { ok: false, error: "A problem is already open for this." };
        if (status !== "dispute_window") return { ok: false, error: "The 7-day window has closed. Contact support. Your statutory rights still apply." };
        if (details.trim().length < 10) return { ok: false, error: "Please describe the problem in a little more detail." };
        setSettlements((ss) => ss.map((x) => x.id === s.id ? { ...x, status: "disputed" } : x));
        setDisputes((d) => [{ id: `DSP-${301 + d.length}`, settlementId: s.id, sourceRef, customerId, reason, details, openedAt: new Date().toISOString(), status: "open" }, ...d]);
        return { ok: true };
      },
      resolveDispute: (id, outcome, note) => {
        const d = disputes.find((x) => x.id === id);
        if (!d) return;
        setDisputes((ds) => ds.map((x) => x.id === id ? { ...x, status: outcome, resolutionNote: note } : x));
        setSettlements((ss) =>
        ss.map((x) => x.id === d.settlementId ? { ...x, status: outcome === "refunded" ? "refunded" : new Date(x.eligibleAt) <= new Date() ? "eligible" : "dispute_window" } : x)
        );
      },
      releaseEligible: () => {
        const eligible = settlements.filter((s) => effectiveStatus(s) === "eligible");
        const byVendor = new Map<string, Settlement[]>();
        eligible.forEach((s) => byVendor.set(s.vendorId, [...(byVendor.get(s.vendorId) ?? []), s]));
        const created: Payout[] = [];
        byVendor.forEach((list, vendorId) => {
          created.push({ id: `PO-${502 + payouts.length + created.length}`, vendorId, amountPence: list.reduce((n, s) => n + s.netPence, 0), settlementIds: list.map((s) => s.id), createdAt: new Date().toISOString(), status: "processing" });
        });
        if (!created.length) return [];
        setPayouts((p) => [...created, ...p]);
        setSettlements((ss) => ss.map((s) => {
          const po = created.find((p) => p.settlementIds.includes(s.id));
          return po ? { ...s, status: "payout_processing", payoutId: po.id } : s;
        }));
        return created;
      },
      confirmPayout: (id, outcome) => {
        const po = payouts.find((p) => p.id === id);
        if (!po || po.status !== "processing") return;
        setPayouts((ps) => ps.map((p) => p.id === id ? { ...p, status: outcome } : p));
        setSettlements((ss) => ss.map((s) => po.settlementIds.includes(s.id) ? { ...s, status: outcome === "paid" ? "paid" : "failed" } : s));
      },
      retrySettlement: (settlementId) => setSettlements((ss) => ss.map((s) => s.id === settlementId && s.status === "failed" ? { ...s, status: "eligible", payoutId: undefined } : s))
    }),
    [settlements, disputes, payouts]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceState {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}