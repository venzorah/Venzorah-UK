import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { BellIcon } from "lucide-react";
import { useMyNotifications } from "../hooks/useMyNotifications";

export function Notifications() {
  const { mine, unread, markAll, markOne } = useMyNotifications();
  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-6 lg:py-10 w-full">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Notifications</h1>
          <p className="text-sm text-muted">{unread} unread</p>
        </div>
        {unread > 0 && <button onClick={markAll} className="h-9 px-3 rounded-lg border border-line bg-white text-sm font-semibold text-navy">Mark all read</button>}
      </div>
      {mine.length === 0 ?
      <div className="mt-8 text-center py-12 bg-white rounded-2xl border border-line">
          <BellIcon className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 font-semibold text-navy">You're all caught up</p>
        </div> :

      <ul className="mt-6 bg-white rounded-2xl border border-line divide-y divide-line">
          {mine.map((n) => {
          const body =
          <>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-gold"}`} aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm ${n.read ? "text-ink" : "font-bold text-navy"}`}>{n.title}</span>
                  <span className="block text-sm text-muted">{n.body}</span>
                  <span className="block mt-1 text-xs text-muted">{formatDistanceToNow(new Date(n.at), { addSuffix: true })}</span>
                </span>
              </>;

          return (
            <li key={n.id}>
                {n.link ?
              <Link to={n.link} onClick={() => markOne(n.id)} className="flex gap-3 px-5 py-4 hover:bg-surface/60">{body}</Link> :

              <button onClick={() => markOne(n.id)} className="w-full text-left flex gap-3 px-5 py-4 hover:bg-surface/60">{body}</button>
              }
              </li>);

        })}
        </ul>
      }
    </div>);

}