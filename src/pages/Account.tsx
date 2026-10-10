import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { OrdersTab } from "../components/account/OrdersTab";
import { BookingsTab } from "../components/account/BookingsTab";
import { WishlistTab } from "../components/account/WishlistTab";
import { AddressesTab } from "../components/account/AddressesTab";
import { SettingsTab } from "../components/account/SettingsTab";

const tabs = [
{ id: "orders", label: "Orders" },
{ id: "bookings", label: "Bookings" },
{ id: "wishlist", label: "Saved" },
{ id: "addresses", label: "Addresses" },
{ id: "settings", label: "Settings" }] as
const;

type TabId = (typeof tabs)[number]["id"];

export function Account() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = (tabs.find((t) => t.id === params.get("tab"))?.id ?? "orders") as TabId;

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Hi, {user?.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link to="/support" className="h-10 px-4 inline-flex items-center rounded-lg border border-line bg-white font-semibold text-navy">Support</Link>
          {user?.role === "customer" && <Link to="/sell" className="h-10 px-4 inline-flex items-center rounded-lg border border-line bg-white font-semibold text-navy whitespace-nowrap">Sell on VenZorah</Link>}
        </div>
      </div>
      <div role="tablist" aria-label="Account sections" className="mt-6 flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-white border border-line p-1 w-full sm:w-auto sm:inline-flex">
        {tabs.map((t) =>
        <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setParams({ tab: t.id })} className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${tab === t.id ? "bg-navy text-white" : "text-ink hover:bg-surface"}`}>
            {t.label}
          </button>
        )}
      </div>
      {tab === "orders" && <OrdersTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "addresses" && <AddressesTab />}
      {tab === "settings" && <SettingsTab />}
    </div>);

}