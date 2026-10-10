import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2Icon } from "lucide-react";
import { usePlatform } from "../contexts/PlatformContext";
import { formatPence } from "../utils/money";

export function OrderConfirmation() {
  const { id } = useParams();
  const { orders, vendors } = usePlatform();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Order not found</h1>
        <Link to="/account" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">My orders</Link>
      </div>);

  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:py-16">
      <span className="h-14 w-14 rounded-2xl bg-gold-50 flex items-center justify-center"><CheckCircle2Icon className="h-7 w-7 text-navy" /></span>
      <h1 className="mt-4 text-3xl font-extrabold text-navy">Order {order.id} confirmed</h1>
      <p className="mt-2 text-muted">
        Each seller has been notified and will ship their items separately. You'll get a notification when they dispatch. (Test mode: no real payment was taken.)
      </p>
      <ul className="mt-8 space-y-3">
        {order.groups.map((g) => {
          const v = vendors.find((x) => x.id === g.vendorId);
          return (
            <li key={g.vendorId} className="bg-white rounded-2xl border border-line p-5">
              <div className="flex justify-between gap-4">
                <p className="font-semibold text-ink">{v?.name}</p>
                <p className="font-bold text-navy">{formatPence(g.merchandisePence + g.shippingPence)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{g.methodName} · {g.estimate}</p>
              <p className="mt-1 text-xs text-muted">Shipping price locked at checkout (seller profile v{g.shippingVersion}).</p>
            </li>);

        })}
      </ul>
      <p className="mt-6 text-lg font-extrabold text-navy">Total {formatPence(order.totalPence)}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/account" className="h-11 px-5 inline-flex items-center rounded-xl bg-navy text-white font-semibold">View orders</Link>
        <Link to="/" className="h-11 px-5 inline-flex items-center rounded-xl border border-line bg-white font-semibold text-navy">Keep shopping</Link>
      </div>
    </div>);

}