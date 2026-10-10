import React from "react";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { AlertTriangleIcon, BadgeCheckIcon, CalendarIcon, PackageIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence } from "../../utils/money";
import { livePrice, planForVendor } from "../../utils/plans";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { fulfilmentLabel } from "../../components/account/OrdersTab";

export function VendorOverview() {
  const { orders, products, plans, bookings, services } = usePlatform();
  const { settlements, statusOf } = useFinance();
  const { vendor, category, isServiceVendor, user } = useCurrentVendor();
  if (!vendor) return null;

  const openGroups = orders.flatMap((o) => o.groups.filter((g) => g.vendorId === vendor.id && ["awaiting_fulfilment", "processing"].includes(g.status)).map((g) => ({ order: o, group: g })));
  const myServiceIds = new Set(services.filter((s) => s.vendorId === vendor.id).map((s) => s.id));
  const upcoming = bookings.filter((b) => myServiceIds.has(b.serviceId) && b.status === "confirmed" && isAfter(new Date(b.start), new Date())).sort((a, b) => a.start.localeCompare(b.start));
  const lowStock = products.filter((p) => p.vendorId === vendor.id).flatMap((p) => p.variants.filter((v) => v.stock <= 5).map((v) => ({ p, v })));
  const mySettlements = settlements.filter((s) => s.vendorId === vendor.id);
  const pending = mySettlements.filter((s) => ["dispute_window", "eligible", "payout_processing"].includes(statusOf(s))).reduce((n, s) => n + s.netPence, 0);
  const onHold = mySettlements.filter((s) => statusOf(s) === "disputed").reduce((n, s) => n + s.netPence, 0);
  const myPlan = planForVendor(vendor, plans);
  const premium = plans.find((p) => p.id === "plan-premium")!;
  const premiumLive = livePrice(premium);
  const hour = new Date().getHours();

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, {user?.name.split(" ")[0]}</h1>
        <StatusPill tone="green"><BadgeCheckIcon className="h-3.5 w-3.5 mr-1" />Approved{category?.registeredBusinessOnly ? " · Registered food business" : ""}</StatusPill>
      </div>
      <p className="mt-1 text-muted">{vendor.name} · {category?.name} · Trading from {vendor.postcode} ({vendor.city} approved zone)</p>

      <div className="mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {isServiceVendor ?
        <section className="bg-white rounded-2xl border border-line" aria-labelledby="upcoming">
            <header className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 id="upcoming" className="font-bold text-navy">Upcoming appointments</h2>
              <Link to="/vendor/calendar" className="text-sm font-semibold text-navy underline">Open calendar</Link>
            </header>
            {upcoming.length === 0 ?
          <div className="px-5 py-12 text-center"><CalendarIcon className="mx-auto h-8 w-8 text-muted" /><p className="mt-2 font-semibold text-ink">No upcoming bookings</p></div> :

          <ul className="divide-y divide-line">
                {upcoming.slice(0, 6).map((b) =>
            <li key={b.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{services.find((s) => s.id === b.serviceId)?.name}</p>
                      <p className="text-sm text-muted">{format(new Date(b.start), "EEE d MMM, HH:mm")} · {b.staff} · {b.id}</p>
                    </div>
                    <p className="font-bold text-navy">{formatPence(b.totalPence)}</p>
                  </li>
            )}
              </ul>
          }
          </section> :

        <section className="bg-white rounded-2xl border border-line" aria-labelledby="todo">
            <header className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 id="todo" className="font-bold text-navy">Orders to fulfil</h2>
              <Link to="/vendor/orders" className="text-sm font-semibold text-navy underline">All orders</Link>
            </header>
            {openGroups.length === 0 ?
          <div className="px-5 py-12 text-center">
                <PackageIcon className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-2 font-semibold text-ink">No orders waiting</p>
                <p className="text-sm text-muted">New orders appear here with their locked delivery terms.</p>
              </div> :

          <ul className="divide-y divide-line">
                {openGroups.map(({ order, group }) =>
            <li key={order.id}>
                    <Link to="/vendor/orders" className="px-5 py-4 flex flex-wrap items-center gap-3 justify-between hover:bg-surface/60">
                      <div>
                        <p className="font-semibold text-ink">{order.id} · {group.lines.reduce((s, l) => s + l.qty, 0)} items</p>
                        <p className="text-sm text-muted">{group.methodName} to {order.postcode} · {group.estimate}</p>
                      </div>
                      <StatusPill tone={fulfilmentLabel[group.status].tone}>{fulfilmentLabel[group.status].label}</StatusPill>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </section>
        }

        <div className="space-y-6">
          <section className="bg-navy text-white rounded-2xl p-5" aria-labelledby="money">
            <h2 id="money" className="text-sm text-white/70">Pending settlement</h2>
            <p className="mt-1 text-3xl font-extrabold">{formatPence(pending)}</p>
            {onHold > 0 && <p className="mt-1 text-sm text-gold">{formatPence(onHold)} on hold for disputes</p>}
            <p className="mt-3 text-xs text-white/60">Released 7 days after delivery or completion, unless a problem is raised.</p>
            <Link to="/vendor/payouts" className="mt-4 inline-flex h-9 px-3 items-center rounded-lg bg-white/10 text-sm font-semibold hover:bg-white/15">View payouts</Link>
          </section>

          <section className="bg-white rounded-2xl border border-line p-5" aria-labelledby="plan">
            <h2 id="plan" className="font-bold text-navy">You're on {myPlan?.name ?? "Free"}</h2>
            <p className="mt-1 text-sm text-muted">
              {vendor.plan === "services" && myPlan ?
              `${formatPence(livePrice(myPlan).monthlyPence)}/month subscription. You keep 100% of every booking — no commission on services.` :
              vendor.plan === "premium" ?
              "0% commission on covered product sales." :
              `5% commission on product sales (shipping excluded). Premium removes it for ${formatPence(premiumLive.monthlyPence)}/month or ${formatPence(premiumLive.annualPence)}/year.`}
            </p>
          </section>

          {lowStock.length > 0 &&
          <section className="bg-white rounded-2xl border border-line p-5" aria-labelledby="stock">
              <h2 id="stock" className="flex items-center gap-2 font-bold text-navy"><AlertTriangleIcon className="h-4 w-4 text-gold-600" />Low stock</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {lowStock.map(({ p, v }) =>
              <li key={v.id} className="flex justify-between"><span>{p.name} · {v.label}</span><span className="font-semibold text-danger">{v.stock} left</span></li>
              )}
              </ul>
            </section>
          }
        </div>
      </div>
    </div>);

}