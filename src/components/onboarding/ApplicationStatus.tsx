import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2Icon, CircleDotIcon, FileTextIcon, UploadIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { useAuth } from "../../contexts/AuthContext";
import { StatusPill } from "../dashboard/StatusPill";
import type { VendorApplication, VerificationStatus } from "../../types/marketplace";

export const verificationLabel: Record<VerificationStatus, {label: string;tone: "grey" | "navy" | "gold" | "green" | "red";}> = {
  draft: { label: "Draft", tone: "grey" },
  submitted: { label: "Submitted", tone: "navy" },
  in_progress: { label: "Verification in progress", tone: "navy" },
  under_review: { label: "Under review", tone: "navy" },
  action_required: { label: "Action required", tone: "gold" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  suspended: { label: "Suspended", tone: "red" }
};

const docTone = { verified: "green", pending: "gold", missing: "red" } as const;

export function ApplicationStatus({ app }: {app: VendorApplication;}) {
  const { categories, decideApplication } = usePlatform();
  const { notify } = useEngagement();
  const { user } = useAuth();
  const [files, setFiles] = useState<Record<string, string>>({});
  const category = categories.find((c) => c.id === app.categoryId);
  const status = verificationLabel[app.status];

  const respond = () => {
    const missing = app.documents.filter((d) => d.state === "missing" && !files[d.name]);
    if (missing.length) return toast.error(`Upload: ${missing.map((d) => d.name).join(", ")}`);
    decideApplication(app.id, "submitted", `Applicant responded with ${Object.keys(files).length} document(s)`, user?.name ?? "Applicant");
    notify("admin", `${app.businessName} responded`, "New documents uploaded for review.", "/admin");
    toast.success("Sent for review");
    setFiles({});
  };

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-8 lg:py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">{app.businessName}</h1>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      <p className="mt-1 text-muted">{category?.name} · {app.businessType} · {app.postcode} ({app.zone}) · Ref {app.id}</p>

      {app.status === "approved" &&
      <div className="mt-6 rounded-2xl bg-navy text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold">You're approved to trade on VenZorah</p>
            <p className="text-sm text-white/70">Set up your storefront, {category?.kind === "product" ? "listings and shipping" : "services and availability"}.</p>
          </div>
          <Link to="/vendor" className="h-11 px-5 inline-flex items-center rounded-xl bg-gold text-navy font-bold">Open vendor dashboard</Link>
        </div>
      }
      {app.status === "rejected" && <p className="mt-6 rounded-2xl bg-red-50 text-danger p-4 text-sm">{app.history[app.history.length - 1]?.note}</p>}

      <section className="mt-8 bg-white rounded-2xl border border-line p-5" aria-labelledby="docs">
        <h2 id="docs" className="font-bold text-navy">Documents</h2>
        <ul className="mt-3 divide-y divide-line">
          {app.documents.map((d) =>
          <li key={d.name} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2"><FileTextIcon className="h-4 w-4 text-muted" />{d.name}{d.fileName && <span className="text-muted">· {d.fileName}</span>}</span>
              {d.state === "missing" && app.status === "action_required" ?
            <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-line text-xs font-semibold text-navy cursor-pointer">
                  <UploadIcon className="h-4 w-4" />{files[d.name] ?? "Upload"}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => {const f = e.target.files?.[0];if (f) setFiles({ ...files, [d.name]: f.name });}} />
                </label> :

            <StatusPill tone={docTone[d.state]}>{d.state}</StatusPill>
            }
            </li>
          )}
        </ul>
        {app.status === "action_required" && <button onClick={respond} className="mt-4 h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Send for review</button>}
      </section>

      <section className="mt-6" aria-labelledby="timeline">
        <h2 id="timeline" className="font-bold text-navy">Progress</h2>
        <ol className="mt-4 space-y-4">
          {[...app.history].reverse().map((h, i) =>
          <li key={i} className="flex gap-3">
              {i === 0 ? <CircleDotIcon className="h-5 w-5 text-navy shrink-0" /> : <CheckCircle2Icon className="h-5 w-5 text-muted shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-ink">{verificationLabel[h.status].label}</p>
                <p className="text-sm text-muted">{h.note}</p>
                <p className="text-xs text-muted">{format(new Date(h.at), "d MMM yyyy, HH:mm")} · {h.by}</p>
              </div>
            </li>
          )}
        </ol>
      </section>
    </div>);

}