import React, { useState } from "react";
import { format } from "date-fns";
import type { SupportTicket } from "../../types/marketplace";

interface TicketThreadProps {
  ticket: SupportTicket;
  viewer: "customer" | "support";
  onReply: (body: string) => void;
}

export function TicketThread({ ticket, viewer, onReply }: TicketThreadProps) {
  const [reply, setReply] = useState("");
  return (
    <div>
      <ol className="space-y-3">
        {ticket.messages.map((m, i) => {
          const mineSide = m.from === viewer;
          return (
            <li key={i} className={`flex ${mineSide ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mineSide ? "bg-navy text-white" : "bg-surface text-ink"}`}>
                <p className={`text-xs font-semibold ${mineSide ? "text-gold" : "text-navy"}`}>{m.author}</p>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mineSide ? "text-white/60" : "text-muted"}`}>{format(new Date(m.at), "d MMM, HH:mm")}</p>
              </div>
            </li>);

        })}
      </ol>
      {ticket.status !== "closed" ?
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          onReply(reply.trim());
          setReply("");
        }}>
        
          <label className="flex-1">
            <span className="sr-only">Reply</span>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Write a reply…" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </label>
          <button className="self-end h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Send</button>
        </form> :

      <p className="mt-4 text-sm text-muted">This ticket is closed.</p>
      }
    </div>);

}