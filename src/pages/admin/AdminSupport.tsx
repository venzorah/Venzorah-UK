import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useEngagement } from "../../contexts/EngagementContext";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { TicketThread } from "../../components/support/TicketThread";
import type { SupportTicket } from "../../types/marketplace";

const tone = { open: "gold", awaiting_customer: "navy", closed: "grey" } as const;
const label = { open: "Needs reply", awaiting_customer: "Awaiting customer", closed: "Closed" } as const;

export function AdminSupport() {
  const { tickets, replyTicket, setTicketStatus, notify } = useEngagement();
  const [filter, setFilter] = useState<SupportTicket["status"] | "all">("open");
  const shown = tickets.filter((t) => filter === "all" || t.status === filter);
  const [activeId, setActiveId] = useState<string | null>(tickets[0]?.id ?? null);
  const active = tickets.find((t) => t.id === activeId);

  return (
    <div className="p-4 lg:p-8 max-w-7xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Support</h1>
      <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0" role="tablist">
        {(["open", "awaiting_customer", "closed", "all"] as const).map((f) =>
        <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`shrink-0 h-9 px-3 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === f ? "bg-navy text-white" : "bg-white border border-line text-ink"}`}>
            {f === "all" ? "All" : label[f]} ({f === "all" ? tickets.length : tickets.filter((t) => t.status === f).length})
          </button>
        )}
      </div>
      <div className="mt-4 grid lg:grid-cols-[340px_1fr] gap-6">
        <ul className="bg-white rounded-2xl border border-line divide-y divide-line self-start">
          {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">Nothing here.</li>}
          {shown.map((t) =>
          <li key={t.id}>
              <button onClick={() => setActiveId(t.id)} className={`w-full text-left px-4 py-3 ${activeId === t.id ? "bg-navy-50" : "hover:bg-surface/60"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink truncate">{t.subject}</p>
                  {t.category === "Privacy request" && <StatusPill tone="red">Privacy</StatusPill>}
                </div>
                <p className="text-xs text-muted">{t.userName} · {t.id} · {formatDistanceToNow(new Date(t.messages[t.messages.length - 1].at), { addSuffix: true })}</p>
              </button>
            </li>
          )}
        </ul>
        <section className="bg-white rounded-2xl border border-line p-5 lg:p-6 min-h-[320px]">
          {active ?
          <>
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 mb-4 border-b border-line">
                <div>
                  <h2 className="font-bold text-navy">{active.subject}</h2>
                  <p className="text-xs text-muted">{active.userName} · {active.category}{active.reference ? ` · ${active.reference}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={tone[active.status]}>{label[active.status]}</StatusPill>
                  {active.status !== "closed" ?
                <button onClick={() => {setTicketStatus(active.id, "closed");notify(active.userId, `${active.id} closed`, "Reply any time to reopen.", "/support");toast("Ticket closed");}} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold">Close</button> :

                <button onClick={() => setTicketStatus(active.id, "open")} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold">Reopen</button>
                }
                </div>
              </div>
              <TicketThread
              ticket={active}
              viewer="support"
              onReply={(body) => {
                replyTicket(active.id, "support", "Support team", body);
                notify(active.userId, `New reply on ${active.id}`, body.slice(0, 90), "/support");
                toast.success("Reply sent");
              }} />
            
            </> :

          <p className="text-sm text-muted">Select a ticket.</p>
          }
        </section>
      </div>
    </div>);

}