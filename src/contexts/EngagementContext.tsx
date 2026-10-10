import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { subHours } from "date-fns";
import type { AppNotification, SupportTicket } from "../types/marketplace";

interface EngagementState {
  notifications: AppNotification[];
  tickets: SupportTicket[];
  notify: (audience: string | undefined, title: string, body: string, link?: string) => void;
  markRead: (audience: string, id?: string) => void;
  openTicket: (input: Omit<SupportTicket, "id" | "status" | "createdAt" | "messages"> & {body: string;}) => SupportTicket;
  replyTicket: (id: string, from: "customer" | "support", author: string, body: string) => void;
  setTicketStatus: (id: string, status: SupportTicket["status"]) => void;
}

const EngagementContext = createContext<EngagementState | null>(null);

const h = (n: number) => subHours(new Date(), n).toISOString();

const seedNotifications: AppNotification[] = [
{ id: "n-1", audience: "u-customer", title: "Welcome to VenZorah", body: "Save favourites and addresses to check out faster.", link: "/account?tab=wishlist", at: h(30), read: false },
{ id: "n-2", audience: "u-ada", title: "Low stock: Ijebu Garri 4 kg", body: "Only 3 left. Update inventory to avoid overselling.", link: "/vendor/products", at: h(5), read: false },
{ id: "n-3", audience: "u-tola", title: "New booking tomorrow", body: "Knotless Braids with Tola at 09:00.", link: "/vendor/calendar", at: h(3), read: false },
{ id: "n-4", audience: "admin", title: "3 vendor applications waiting", body: "Oldest submitted 2 days ago.", link: "/admin", at: h(2), read: false }];


const seedTickets: SupportTicket[] = [
{
  id: "TCK-2201",
  userId: "u-customer",
  userName: "Chioma Okafor",
  subject: "Can I change my delivery address?",
  category: "Order",
  reference: "VZ-20412",
  status: "awaiting_customer",
  createdAt: h(26),
  messages: [
  { from: "customer", author: "Chioma Okafor", body: "I entered my old flat number. Can the seller update it?", at: h(26) },
  { from: "support", author: "Support team", body: "We've asked the seller. They haven't dispatched yet, so it can be updated. Please confirm the full address here.", at: h(22) }]

}];


export function EngagementProvider({ children }: {children: React.ReactNode;}) {
  const [notifications, setNotifications] = usePersistentState<AppNotification[]>("vz-notifications-v3", seedNotifications, "session");
  const [tickets, setTickets] = usePersistentState<SupportTicket[]>("vz-tickets-v3", seedTickets, "session");

  const value = useMemo<EngagementState>(
    () => ({
      notifications,
      tickets,
      notify: (audience, title, body, link) => {
        if (!audience) return;
        setNotifications((n) => [{ id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, audience, title, body, link, at: new Date().toISOString(), read: false }, ...n]);
      },
      markRead: (audience, id) => setNotifications((n) => n.map((x) => x.audience === audience && (!id || x.id === id) ? { ...x, read: true } : x)),
      openTicket: ({ body, ...input }) => {
        const now = new Date().toISOString();
        const ticket: SupportTicket = { ...input, id: `TCK-${2202 + tickets.length}`, status: "open", createdAt: now, messages: [{ from: "customer", author: input.userName, body, at: now }] };
        setTickets((t) => [ticket, ...t]);
        return ticket;
      },
      replyTicket: (id, from, author, body) =>
      setTickets((t) =>
      t.map((x) => x.id === id ? { ...x, status: from === "support" ? "awaiting_customer" : "open", messages: [...x.messages, { from, author, body, at: new Date().toISOString() }] } : x)
      ),
      setTicketStatus: (id, status) => setTickets((t) => t.map((x) => x.id === id ? { ...x, status } : x))
    }),
    [notifications, tickets]
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagement(): EngagementState {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error("useEngagement must be used inside EngagementProvider");
  return ctx;
}