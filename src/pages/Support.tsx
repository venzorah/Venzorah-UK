import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useEngagement } from "../contexts/EngagementContext";
import { useCms } from "../contexts/CmsContext";
import { StatusPill } from "../components/dashboard/StatusPill";
import { TicketThread } from "../components/support/TicketThread";
import type { SupportTicket } from "../types/marketplace";

const categories: SupportTicket["category"][] = ["Order", "Booking", "Payment", "Account", "Other"];
const statusTone = { open: "navy", awaiting_customer: "gold", closed: "grey" } as const;
const statusLabel = { open: "Waiting for support", awaiting_customer: "Reply needed", closed: "Closed" } as const;

export function Support() {
  const { user } = useAuth();
  const { tickets, openTicket, replyTicket, notify } = useEngagement();
  const { pages } = useCms();
  const mine = tickets.filter((t) => t.userId === user?.id);
  const [activeId, setActiveId] = useState<string | null>(mine[0]?.id ?? null);
  const [creating, setCreating] = useState(mine.length === 0);
  const [form, setForm] = useState({ subject: "", category: "Order" as SupportTicket["category"], reference: "", body: "" });
  const active = mine.find((t) => t.id === activeId);

  if (!user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.subject.trim().length < 4 || form.body.trim().length < 10) return toast.error("Add a subject and a short description");
    const t = openTicket({ userId: user.id, userName: user.name, subject: form.subject.trim(), category: form.category, reference: form.reference.trim() || undefined, body: form.body.trim() });
    notify("admin", `New ticket ${t.id}`, t.subject, "/admin/support");
    notify(user.id, `We've received ${t.id}`, "Our team usually replies within one working day.", "/support");
    toast.success(`Ticket ${t.id} created`);
    setForm({ subject: "", category: "Order", reference: "", body: "" });
    setCreating(false);
    setActiveId(t.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Support</h1>
          <p className="text-sm text-muted">Quick answers in <Link to="/help/faqs" className="underline">FAQs</Link> · Problems with a delivered order? Use “Report a problem” on <Link to="/account" className="underline">your orders</Link>.</p>
        </div>
        <button onClick={() => setCreating(true)} className="h-10 px-4 rounded-lg bg-gold text-navy text-sm font-bold">New request</button>
      </div>

      <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-6">
        <aside aria-label="Your requests">
          {mine.length === 0 ?
          <p className="text-sm text-muted">No requests yet.</p> :

          <ul className="bg-white rounded-2xl border border-line divide-y divide-line">
              {mine.map((t) =>
            <li key={t.id}>
                  <button onClick={() => {setActiveId(t.id);setCreating(false);}} aria-current={activeId === t.id && !creating} className={`w-full text-left px-4 py-3 ${activeId === t.id && !creating ? "bg-navy-50" : "hover:bg-surface/60"}`}>
                    <p className="text-sm font-semibold text-ink truncate">{t.subject}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusPill tone={statusTone[t.status]}>{statusLabel[t.status]}</StatusPill>
                      <span className="text-xs text-muted">{t.id}</span>
                    </div>
                  </button>
                </li>
            )}
            </ul>
          }
          <nav className="mt-6" aria-label="Help topics">
            <p className="text-xs font-semibold text-muted">Help topics</p>
            <ul className="mt-2 space-y-1 text-sm">
              {pages.filter((p) => ["faqs", "shipping-returns", "cancellations", "contact"].includes(p.slug)).map((p) =>
              <li key={p.slug}><Link to={`/help/${p.slug}`} className="text-navy hover:underline">{p.title}</Link></li>
              )}
            </ul>
          </nav>
        </aside>

        <section className="bg-white rounded-2xl border border-line p-5 lg:p-6 min-h-[320px]">
          {creating ?
          <form onSubmit={submit} className="space-y-4" aria-label="New support request">
              <h2 className="font-bold text-navy">How can we help?</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block"><span className="text-xs font-semibold text-muted">Topic</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SupportTicket["category"] })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm bg-white">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block"><span className="text-xs font-semibold text-muted">Order or booking reference (optional)</span><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. VZ-20412" className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              </div>
              <label className="block"><span className="text-xs font-semibold text-muted">Subject</span><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block"><span className="text-xs font-semibold text-muted">Message</span><textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /></label>
              <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Send request</button>
            </form> :
          active ?
          <>
              <div className="flex flex-wrap items-start justify-between gap-2 pb-4 mb-4 border-b border-line">
                <div>
                  <h2 className="font-bold text-navy">{active.subject}</h2>
                  <p className="text-xs text-muted">{active.id} · {active.category}{active.reference ? ` · ${active.reference}` : ""} · opened {format(new Date(active.createdAt), "d MMM")}</p>
                </div>
                <StatusPill tone={statusTone[active.status]}>{statusLabel[active.status]}</StatusPill>
              </div>
              <TicketThread ticket={active} viewer="customer" onReply={(body) => {replyTicket(active.id, "customer", user.name, body);notify("admin", `Reply on ${active.id}`, body.slice(0, 80), "/admin/support");}} />
            </> :

          <p className="text-sm text-muted">Select a request.</p>
          }
        </section>
      </div>
    </div>);

}