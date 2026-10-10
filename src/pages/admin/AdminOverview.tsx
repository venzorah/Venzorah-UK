import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangleIcon, CheckIcon, FileTextIcon, XIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";
import type { VendorApplication } from "../../types/marketplace";
import { formatPence } from "../../utils/money";
import { livePrice } from "../../utils/plans";
import { StatusPill } from "../../components/dashboard/StatusPill";

const docTone = { verified: "green", pending: "gold", missing: "red" } as const;

export function AdminOverview() {
  const { orders, plans, products, vendors, audit, categories, applications, setProductModeration, decideApplication } = usePlatform();
  const { promoteToVendor } = useAuth();
  const { notify } = useEngagement();
  const apps = applications.filter((a) => !["approved", "rejected"].includes(a.status));
  const [openId, setOpenId] = useState<string | null>(applications[0]?.id ?? null);

  const gmv = orders.reduce((s, o) => s + o.totalPence, 0);
  const commission = orders.flatMap((o) => o.groups).reduce((s, g) => s + g.commissionPence, 0);
  const mrr = plans.reduce((n, p) => n + p.subscribers * livePrice(p).monthlyPence, 0);
  const pendingListings = products.filter((p) => p.moderation === "pending");

  const decide = (app: VendorApplication, decision: "approve" | "reject" | "request") => {
    const blocking = app.flag || app.documents.some((d) => d.state !== "verified");
    if (decision === "approve" && blocking) {
      toast.error(app.flag ?? "All required documents must be verified before approval.");
      return;
    }
    const note =
    decision === "approve" ? "All checks passed" : decision === "reject" ? app.flag ?? "Application does not meet requirements" : `Please provide: ${app.documents.filter((d) => d.state !== "verified").map((d) => d.name).join(", ") || "additional information"}`;
    const status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "action_required";
    const { vendorId } = decideApplication(app.id, status, note, "Super Admin");
    if (vendorId && app.userId) promoteToVendor(app.userId, vendorId);
    notify(
      app.userId,
      decision === "approve" ? "You're approved to sell on VenZorah" : decision === "reject" ? "Application not approved" : "Action needed on your application",
      note,
      decision === "approve" ? "/vendor" : "/sell"
    );
    toast.success(decision === "approve" ? `${app.businessName} approved` : decision === "reject" ? `${app.businessName} rejected` : `More information requested from ${app.businessName}`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Operations</h1>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 pb-6 border-b border-line">
        <div><dt className="text-xs text-muted">Active vendors</dt><dd className="text-2xl font-extrabold text-navy">{vendors.filter((v) => v.verification === "approved").length}</dd></div>
        <div><dt className="text-xs text-muted">Awaiting verification</dt><dd className="text-2xl font-extrabold text-navy">{apps.length}</dd></div>
        <div><dt className="text-xs text-muted">Order value (session)</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(gmv)}</dd></div>
        <div><dt className="text-xs text-muted">Commission accrued</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(commission)}</dd></div>
        <div><dt className="text-xs text-muted">Subscription MRR</dt><dd className="text-2xl font-extrabold text-navy">{formatPence(mrr)}</dd></div>
      </dl>

      <div className="mt-6 grid xl:grid-cols-[1.5fr_1fr] gap-6">
        <section className="bg-white rounded-2xl border border-line" aria-labelledby="queue">
          <header className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 id="queue" className="font-bold text-navy">Verification queue</h2>
            <span className="text-sm text-muted">{apps.length} applications</span>
          </header>
          {apps.length === 0 ?
          <p className="px-5 py-12 text-center text-muted">Queue clear.</p> :

          <ul className="divide-y divide-line">
              {apps.map((app) => {
              const open = openId === app.id;
              return (
                <li key={app.id}>
                    <button onClick={() => setOpenId(open ? null : app.id)} aria-expanded={open} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface/60">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink">{app.businessName}</p>
                        <p className="text-sm text-muted">{categories.find((c) => c.id === app.categoryId)?.name} · {app.businessType} · {app.postcode}{app.companyNumber ? ` · CH ${app.companyNumber}` : ""}</p>
                      </div>
                      {app.flag ? <StatusPill tone="red">Ineligible</StatusPill> : app.status === "action_required" ? <StatusPill tone="gold">Action required</StatusPill> : <StatusPill tone="navy">{app.status === "under_review" ? "Under review" : "Submitted"}</StatusPill>}
                    </button>
                    {open &&
                  <div className="px-5 pb-5">
                        {app.flag && <p className="flex items-start gap-2 rounded-xl bg-red-50 text-danger text-sm p-3"><AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />{app.flag}</p>}
                        <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                          {app.documents.map((d) =>
                      <li key={d.name} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                              <span className="flex items-center gap-2"><FileTextIcon className="h-4 w-4 text-muted" />{d.name}</span>
                              <StatusPill tone={docTone[d.state]}>{d.state}</StatusPill>
                            </li>
                      )}
                        </ul>
                        <p className="mt-3 text-xs text-muted">Zone check: {app.zone}. Contact: {app.contactEmail} · {app.contactPhone}. Companies House data alone does not confirm identity or food registration.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => decide(app, "approve")} className="h-9 px-4 rounded-lg bg-navy text-white text-sm font-semibold inline-flex items-center gap-1.5"><CheckIcon className="h-4 w-4" />Approve</button>
                          <button onClick={() => decide(app, "request")} className="h-9 px-4 rounded-lg border border-line text-sm font-semibold text-navy">Request information</button>
                          <button onClick={() => decide(app, "reject")} className="h-9 px-4 rounded-lg border border-line text-sm font-semibold text-danger inline-flex items-center gap-1.5"><XIcon className="h-4 w-4" />Reject</button>
                        </div>
                      </div>
                  }
                  </li>);

            })}
            </ul>
          }
        </section>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-line" aria-labelledby="mod">
            <header className="px-5 py-4 border-b border-line"><h2 id="mod" className="font-bold text-navy">Listings to moderate</h2></header>
            {pendingListings.length === 0 ?
            <p className="px-5 py-8 text-center text-sm text-muted">Nothing waiting.</p> :

            <ul className="divide-y divide-line">
                {pendingListings.map((p) =>
              <li key={p.id} className="px-5 py-4 flex items-center gap-3">
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-xs text-muted">{vendors.find((v) => v.id === p.vendorId)?.name}</p>
                    </div>
                    <button onClick={() => {setProductModeration(p.id, "approved", "Information complete");toast.success("Listing approved and now public");}} className="h-8 px-3 rounded-lg bg-navy text-white text-xs font-semibold">Approve</button>
                    <button onClick={() => {setProductModeration(p.id, "rejected", "Allergen statement missing");toast("Sent back to vendor");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-danger">Reject</button>
                  </li>
              )}
              </ul>
            }
          </section>

          <section className="bg-white rounded-2xl border border-line" aria-labelledby="audit">
            <header className="px-5 py-4 border-b border-line"><h2 id="audit" className="font-bold text-navy">Audit log</h2></header>
            <ol className="divide-y divide-line max-h-96 overflow-y-auto">
              {audit.map((a) =>
              <li key={a.id} className="px-5 py-3 text-sm">
                  <p className="font-semibold text-ink">{a.action}</p>
                  <p className="text-muted">{a.detail}</p>
                  <p className="text-xs text-muted mt-0.5">{a.actor} · {format(new Date(a.at), "d MMM, HH:mm")}</p>
                </li>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>);

}