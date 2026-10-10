import React from "react";
import { StatusPill } from "../dashboard/StatusPill";
import type { SettlementStatus } from "../../types/marketplace";

const map: Record<SettlementStatus, {label: string;tone: "gold" | "navy" | "green" | "red" | "grey";}> = {
  dispute_window: { label: "Dispute window active", tone: "gold" },
  disputed: { label: "Disputed — funds on hold", tone: "red" },
  eligible: { label: "Eligible for release", tone: "navy" },
  payout_processing: { label: "Payout processing", tone: "navy" },
  paid: { label: "Paid to seller", tone: "green" },
  refunded: { label: "Refunded", tone: "grey" },
  failed: { label: "Settlement failed", tone: "red" }
};

export function SettlementStatusPill({ status }: {status: SettlementStatus;}) {
  return <StatusPill tone={map[status].tone}>{map[status].label}</StatusPill>;
}