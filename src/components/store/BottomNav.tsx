import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarIcon, HomeIcon, LayoutGridIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

const items = [
{ to: "/", label: "Home", icon: HomeIcon },
{ to: "/browse", label: "Browse", icon: LayoutGridIcon },
{ to: "/account?tab=bookings", label: "Bookings", icon: CalendarIcon },
{ to: "/cart", label: "Basket", icon: ShoppingBagIcon },
{ to: "/account", label: "Account", icon: UserIcon }];


export function BottomNav() {
  const { count } = useCart();
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get("tab");

  const isActive = (label: string) => {
    switch (label) {
      case "Home":
        return pathname === "/";
      case "Browse":
        return pathname.startsWith("/browse") || pathname.startsWith("/c/") || pathname.startsWith("/p/") || pathname.startsWith("/s/");
      case "Bookings":
        return pathname === "/account" && tab === "bookings";
      case "Basket":
        return pathname === "/cart" || pathname === "/checkout";
      default:
        return pathname === "/account" && tab !== "bookings" || ["/notifications", "/support"].includes(pathname);
    }
  };

  return (
    <nav aria-label="Primary" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(label);
          return (
            <li key={label}>
              <Link to={to} aria-current={active ? "page" : undefined} className={`relative flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-semibold ${active ? "text-navy" : "text-muted"}`}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />}
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {label === "Basket" && count > 0 &&
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">{count}</span>
                  }
                </span>
                {label}
              </Link>
            </li>);

        })}
      </ul>
    </nav>);

}