import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCartSummary } from "../hooks/useCartSummary";
import { formatPence } from "../utils/money";
import { PostcodeEditor } from "../components/store/PostcodeEditor";

export function Cart() {
  const navigate = useNavigate();
  const { setQty, remove, selectMethod, postcode } = useCart();
  const { groups, merchandise, shipping, total, allShippable, unavailable } = useCartSummary();

  if (groups.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="mx-auto h-16 w-16 rounded-2xl bg-gold-50 flex items-center justify-center"><ShoppingBagIcon className="h-8 w-8 text-navy" /></span>
        <h1 className="mt-4 text-2xl font-extrabold text-navy">Your basket is empty</h1>
        {unavailable.length > 0 && <p className="mt-2 text-sm text-danger">Removed unavailable items: {unavailable.join(", ")}</p>}
        <Link to="/c/african-foods" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-gold text-navy font-bold">Start shopping</Link>
      </div>);

  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-10">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Basket</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="-ml-2"><PostcodeEditor /></div>
        <p className="text-sm text-muted">Each seller ships their own items separately.</p>
      </div>
      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
        <div className="space-y-5">
          {groups.map((g) => {
            const threshold = g.vendor.shipping.freeThresholdPence;
            const remaining = threshold ? threshold - g.merchandisePence : 0;
            return (
              <section key={g.vendor.id} className="bg-white rounded-2xl border border-line" aria-label={`Items from ${g.vendor.name}`}>
                <header className="flex items-center gap-3 px-5 py-4 border-b border-line">
                  <span className="h-9 w-9 rounded-lg bg-navy text-gold text-sm font-extrabold flex items-center justify-center">{g.vendor.initials}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{g.vendor.name}</p>
                    <p className="text-xs text-muted">Ships from {g.vendor.city}</p>
                  </div>
                </header>
                <ul className="divide-y divide-line">
                  {g.lines.map((l) =>
                  <li key={l.variant.id} className="flex gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                      <img src={l.product.image} alt="" className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl object-cover bg-surface" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/p/${l.product.slug}`} className="font-semibold text-ink hover:text-navy">{l.product.name}</Link>
                        <p className="text-xs text-muted">{l.variant.label} · {formatPence(l.variant.pricePence)} each</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center h-9 rounded-lg border border-line">
                            <button onClick={() => setQty(l.variant.id, l.qty - 1, l.variant.stock)} className="h-9 w-9 flex items-center justify-center" aria-label="Decrease"><MinusIcon className="h-3.5 w-3.5" /></button>
                            <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                            <button onClick={() => setQty(l.variant.id, l.qty + 1, l.variant.stock)} className="h-9 w-9 flex items-center justify-center" aria-label="Increase"><PlusIcon className="h-3.5 w-3.5" /></button>
                          </div>
                          <button onClick={() => remove(l.variant.id)} className="h-9 w-9 flex items-center justify-center text-muted hover:text-danger" aria-label={`Remove ${l.product.name}`}><Trash2Icon className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="font-bold text-navy whitespace-nowrap">{formatPence(l.linePence)}</p>
                    </li>
                  )}
                </ul>
                <fieldset className="px-5 py-4 border-t border-line bg-surface/60 rounded-b-2xl">
                  <legend className="sr-only">Delivery from {g.vendor.name}</legend>
                  <p className="text-sm font-semibold text-ink mb-2">Delivery</p>
                  {threshold && remaining > 0 && <p className="text-xs text-navy mb-3">Add {formatPence(remaining)} more from {g.vendor.name} for free standard delivery.</p>}
                  <div className="space-y-2">
                    {g.options.map((o) =>
                    <label key={o.method.id} className={`flex items-start gap-3 rounded-xl border bg-white p-3 ${g.selected?.method.id === o.method.id ? "border-navy" : "border-line"} ${o.eligible ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                        <input type="radio" name={`ship-${g.vendor.id}`} disabled={!o.eligible} checked={g.selected?.method.id === o.method.id} onChange={() => selectMethod(g.vendor.id, o.method.id)} className="mt-1 accent-navy" />
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-ink">{o.method.name}</span>
                          <span className="block text-xs text-muted">{o.eligible ? `${o.estimate} · ${o.dispatchBy}` : o.reason}</span>
                        </span>
                        <span className="text-sm font-bold text-navy">{o.pricePence === 0 ? "Free" : formatPence(o.pricePence)}</span>
                      </label>
                    )}
                    {!g.selected && <p className="text-xs text-danger">This seller can't deliver to {postcode}. Change your postcode or remove these items.</p>}
                  </div>
                </fieldset>
              </section>);

          })}
        </div>
        <aside className="lg:sticky lg:top-36 self-start bg-white rounded-2xl border border-line p-5" aria-label="Order summary">
          <h2 className="font-bold text-navy">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Items</dt><dd>{formatPence(merchandise)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery ({groups.length} seller{groups.length > 1 ? "s" : ""})</dt><dd>{formatPence(shipping)}</dd></div>
            <div className="flex justify-between pt-3 border-t border-line text-base font-extrabold text-navy"><dt>Total</dt><dd>{formatPence(total)}</dd></div>
          </dl>
          <button disabled={!allShippable} onClick={() => navigate("/checkout")} className="mt-5 w-full h-12 rounded-xl bg-gold text-navy font-bold disabled:bg-line disabled:text-muted">
            Checkout
          </button>
        </aside>
      </div>
    </div>);

}