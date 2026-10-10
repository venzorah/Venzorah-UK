import { useAuth } from "../contexts/AuthContext";
import { useEngagement } from "../contexts/EngagementContext";

export function useMyNotifications() {
  const { user } = useAuth();
  const { notifications, markRead } = useEngagement();
  const audience = user ? user.role === "admin" ? "admin" : user.id : "";
  const mine = notifications.filter((n) => n.audience === audience);
  return { mine, unread: mine.filter((n) => !n.read).length, markAll: () => markRead(audience), markOne: (id: string) => markRead(audience, id) };
}