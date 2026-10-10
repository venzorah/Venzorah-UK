import React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { RouteErrorBoundary } from "../RouteErrorBoundary";
import { ArrowLeftIcon, LogOutIcon, BoxIcon } from "lucide-react";
import { Logo } from "../Logo";
import { useAuth } from "../../contexts/AuthContext";
import { useMyNotifications } from "../../hooks/useMyNotifications";
export interface ShellNavItem {
  to: string;
  label: string;
  icon: BoxIcon;
  end?: boolean;
  badge?: "notifications";
}
interface DashboardShellProps {
  portal: string;
  account?: string;
  nav: ShellNavItem[];
}
export function DashboardShell({
  portal,
  account,
  nav
}: DashboardShellProps) {
  const {
    user,
    logout
  } = useAuth();
  const {
    unread
  } = useMyNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const signOut = () => {
    logout();
    navigate("/");
  };
  return <div className="min-h-screen w-full bg-surface lg:flex">
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col bg-navy text-white sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden"><Logo variant="icon" className="h-9 w-9" /></span>
          <div>
            <p className="font-extrabold leading-tight">Ven<span className="text-gold">Zorah</span></p>
            <p className="text-xs text-white/60">{portal}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" aria-label={portal}>
          {nav.map(({
          to,
          label,
          icon: Icon,
          end,
          badge
        }) => <NavLink key={to} to={to} end={end} className={({
          isActive
        }) => `relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
              {({
            isActive
          }) => <>
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gold" />}
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {badge === "notifications" && unread > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gold text-navy text-[11px] font-bold flex items-center justify-center">{unread}</span>}
                </>}
            </NavLink>)}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/60">Signed in as</p>
          <p className="text-sm font-semibold truncate">{account ?? user?.name}</p>
          <div className="mt-3 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"><ArrowLeftIcon className="h-3.5 w-3.5" />Marketplace</Link>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white"><LogOutIcon className="h-3.5 w-3.5" />Sign out</button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-30 bg-navy text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center overflow-hidden"><Logo variant="icon" className="h-7 w-7" /></span>
            <span className="font-extrabold">{portal}</span>
          </Link>
          <button onClick={signOut} className="text-xs text-white/70 inline-flex items-center gap-1"><LogOutIcon className="h-3.5 w-3.5" />Sign out</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2" aria-label={portal}>
          {nav.map(({
          to,
          label,
          end,
          badge
        }) => <NavLink key={to} to={to} end={end} className={({
          isActive
        }) => `shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-full text-sm whitespace-nowrap ${isActive ? "bg-gold text-navy font-semibold" : "text-white/80"}`}>
              {label}
              {badge === "notifications" && unread > 0 && <span className="h-2 w-2 rounded-full bg-gold" />}
            </NavLink>)}
        </nav>
      </div>

      <main className="flex-1 min-w-0">
        <RouteErrorBoundary key={pathname} resetKey={location.key}>
          <Outlet />
        </RouteErrorBoundary>
      </main>
    </div>;
}