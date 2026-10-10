import { subDays } from "date-fns";
import type { Payout, Settlement } from "../types/marketplace";

const iso = (daysAgo: number) => subDays(new Date(), daysAgo).toISOString();
const plus7 = (daysAgo: number) => subDays(new Date(), daysAgo - 7).toISOString();

export const seedSettlements: Settlement[] = [
{ id: "ST-901", vendorId: "v-ada", source: "order", sourceRef: "VZ-20390", customerId: "u-other", grossPence: 4620, commissionPence: 206, netPence: 4414, milestone: "Delivered (seller-reported)", milestoneAt: iso(9), eligibleAt: plus7(9), status: "dispute_window" },
{ id: "ST-902", vendorId: "v-ada", source: "order", sourceRef: "VZ-20412", customerId: "u-customer", grossPence: 2995, commissionPence: 125, netPence: 2870, milestone: "Delivered (seller-reported)", milestoneAt: iso(3), eligibleAt: plus7(3), status: "dispute_window" },
{ id: "ST-903", vendorId: "v-crown", source: "booking", sourceRef: "BK-1031", customerId: "u-other", grossPence: 14500, commissionPence: 0, netPence: 14500, milestone: "Service completed", milestoneAt: iso(12), eligibleAt: plus7(12), status: "dispute_window" },
{ id: "ST-904", vendorId: "v-crown", source: "booking", sourceRef: "BK-1036", customerId: "u-customer", grossPence: 14500, commissionPence: 0, netPence: 14500, milestone: "Service completed", milestoneAt: iso(2), eligibleAt: plus7(2), status: "dispute_window" },
{ id: "ST-880", vendorId: "v-ada", source: "order", sourceRef: "VZ-20288", customerId: "u-other", grossPence: 3150, commissionPence: 133, netPence: 3017, milestone: "Delivered (seller-reported)", milestoneAt: iso(20), eligibleAt: plus7(20), status: "paid", payoutId: "PO-501" }];


export const seedPayouts: Payout[] = [
{ id: "PO-501", vendorId: "v-ada", amountPence: 3017, settlementIds: ["ST-880"], createdAt: iso(12), status: "paid" }];