import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BellIcon, SearchIcon, ShoppingBagIcon, StoreIcon, UserIcon } from "lucide-react";
import { PostcodeEditor } from "./PostcodeEditor";
import { Logo } from "../Logo";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useMyNotifications } from "../../hooks/useMyNotifications";
import { usePublicCatalog } from "../../hooks/useCatalog";

export function StoreHeader() {
  const navigate = useNavigate();
  const { count } = useCart();
  const { categories } = usePublicCatalog();
  const { user } = useAuth();
  const { unread } = useMyNotifications();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-line">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-center gap-3 lg:gap-6 h-16">
          <Link to="/" className="shrink-0" aria-label="VenZorah home">
            <Logo className="h-9 lg:h-10 w-auto" />
          </Link>

          <div className="relative hidden lg:block">
            <PostcodeEditor />
          </div>

          <form
            role="search"
            className="flex-1 hidden sm:flex"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/browse?q=${encodeURIComponent(q)}`);
            }}>
            
            <label className="relative w-full">
              <span className="sr-only">Search products, stores and services</span>
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search garri, braids, massage, stores…"
                className="w-full h-11 rounded-xl bg-surface border border-transparent pl-10 pr-4 text-sm placeholder:text-muted focus:bg-white focus:border-navy focus:outline-none" />
              
            </label>
          </form>

          <nav className="ml-auto flex items-center gap-1" aria-label="Account">
            <Link to={user?.role === "vendor" ? "/vendor" : user?.role === "admin" ? "/admin" : "/sell"} className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-semibold text-navy hover:bg-surface whitespace-nowrap">
              <StoreIcon className="h-4 w-4" /> {user?.role === "vendor" ? "Vendor dashboard" : user?.role === "admin" ? "Admin portal" : "Sell on VenZorah"}
            </Link>
            {user ?
            <>
                <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy hover:bg-surface" aria-label={`Notifications, ${unread} unread`}>
                  <BellIcon className="h-5 w-5" />
                  {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white" />}
                </Link>
                <Link to="/account" className="hidden md:flex h-10 items-center gap-2 px-2 rounded-lg text-navy hover:bg-surface" aria-label="Account">
                  <span className="h-7 w-7 rounded-full bg-navy text-gold text-xs font-bold flex items-center justify-center">{user.name.charAt(0)}</span>
                </Link>
              </> :

            <Link to="/login" aria-label="Sign in" className="flex h-10 items-center gap-2 px-2.5 sm:px-3 rounded-lg text-sm font-semibold text-navy hover:bg-surface whitespace-nowrap">
                <UserIcon className="h-5 w-5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Sign in</span>
              </Link>
            }
            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy hover:bg-surface" aria-label={`Basket, ${count} items`}>
              <ShoppingBagIcon className="h-5 w-5" />
              {count > 0 &&
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-navy text-[11px] font-bold flex items-center justify-center">
                  {count}
                </span>
              }
            </Link>
          </nav>
        </div>

        <form
          role="search"
          className="sm:hidden pb-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/browse?q=${encodeURIComponent(q)}`);
          }}>
          
          <label className="relative block">
            <span className="sr-only">Search</span>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products & services"
              className="w-full h-11 rounded-xl bg-surface pl-10 pr-4 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy" />
            
          </label>
        </form>

        <nav aria-label="Categories" className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 pb-2">
          {categories.map((c) =>
          <NavLink
            key={c.id}
            to={`/c/${c.slug}`}
            className={({ isActive }) =>
            `shrink-0 px-3 h-8 inline-flex items-center rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
            isActive ? "bg-navy text-white" : "text-ink hover:bg-surface"}`

            }>
            
              {c.name}
            </NavLink>
          )}
        </nav>
      </div>
    </header>);

}