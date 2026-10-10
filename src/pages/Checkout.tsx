import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LockIcon } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { usePlatform } from "../contexts/PlatformContext";
import { useCartSummary } from "../hooks/useCartSummary";
import { useAuth } from "../contexts/AuthContext";
import { useCustomer } from "../contexts/CustomerContext";
import { useEngagement } from "../contexts/EngagementContext";
import { formatPence } from "../utils/money";
import { isValidUkPostcode } from "../utils/shipping";
import type { Order } from "../types/marketplace";

interface FormState {
  name: string;
  email: string;
  line1: string;
  city: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { postcode, setPostcode, clear } = useCart();
  const { recordOrder, orders } = usePlatform();
  const { user, userIdForVendor } = useAuth();
  const { addresses, saveAddress } = useCustomer();
  const { notify } = useEngagement();
  const summary = useCartSummary();
  const defaultAddr = addresses.find((a) => a.isDefault);
  const [form, setForm] = useState<FormState>({ name: defaultAddr?.name ?? user?.name ?? "", email: user?.email ?? "", line1: defaultAddr?.line1 ?? "", city: defaultAddr?.city ?? "" });
  const [saveForLater, setSaveForLater] = useState(addresses.length === 0);
  const usedDefault = !!defaultAddr;
  useEffect(() => {
    if (defaultAddr && defaultAddr.postcode !== postcode) setPostcode(defaultAddr.postcode);
    // Prefill once on arrival only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "postcode", string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (summary.groups.length === 0) return <Navigate to="/cart" replace />;

  const field = (k: keyof FormState, label: string, type = "text", autoComplete?: string) =>
  <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input type={type} autoComplete={autoComplete} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} className={`mt-1 w-full h-11 rounded-xl border px-3 text-sm ${errors[k] ? "border-danger" : "border-line"}`} />
      {errors[k] && <span className="mt-1 block text-xs text-danger">{errors[k]}</span>}
    </label>;


  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.line1.trim()) next.line1 = "Enter your address";
    if (!form.city.trim()) next.city = "Enter your town or city";
    if (!isValidUkPostcode(postcode)) next.postcode = "Enter a valid UK postcode";
    setErrors(next);
    if (Object.keys(next).length || !summary.allShippable) return;
    setSubmitting(true);
    setTimeout(() => {
      const order: Order = {
        id: `VZ-${(20481 + orders.length).toString()}`,
        customerId: user?.id ?? "guest",
        createdAt: new Date().toISOString(),
        postcode,
        totalPence: summary.total,
        paymentStatus: "confirmed",
        groups: summary.groups.map((g) => ({
          vendorId: g.vendor.id,
          lines: g.lines.map((l) => ({ productId: l.product.id, variantId: l.variant.id, qty: l.qty, unitPence: l.variant.pricePence })),
          merchandisePence: g.merchandisePence,
          shippingPence: g.selected!.pricePence,
          methodName: g.selected!.method.name,
          methodType: g.selected!.method.type,
          estimate: g.selected!.estimate,
          shippingVersion: g.vendor.shipping.version,
          commissionBps: g.commissionBps,
          commissionPence: g.commissionPence,
          status: "awaiting_fulfilment"
        }))
      };
      recordOrder(order);
      if (saveForLater && !usedDefault) saveAddress({ label: "Home", name: form.name, line1: form.line1, city: form.city, postcode, isDefault: true });
      notify(user?.id, `Order ${order.id} confirmed`, `${order.groups.length} seller${order.groups.length > 1 ? "s" : ""} will prepare your items.`, `/order/${order.id}`);
      order.groups.forEach((g) => notify(userIdForVendor(g.vendorId), `New order ${order.id}`, `${g.lines.reduce((s, l) => s + l.qty, 0)} items · ${g.methodName} to ${postcode}`, "/vendor/orders"));
      clear();
      navigate(`/order/${order.id}`);
    }, 600);
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-6xl px-4 lg:px-6 py-6 lg:py-10 grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Checkout</h1>
        <section className="mt-6 bg-white rounded-2xl border border-line p-5 lg:p-6" aria-labelledby="addr">
          <h2 id="addr" className="font-bold text-navy">Delivery details</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {field("name", "Full name", "text", "name")}
            {field("email", "Email", "email", "email")}
            <div className="sm:col-span-2">{field("line1", "Address", "text", "address-line1")}</div>
            {field("city", "Town or city", "text", "address-level2")}
            <label className="block">
              <span className="text-sm font-semibold text-ink">Postcode</span>
              <input value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} autoComplete="postal-code" aria-invalid={!!errors.postcode} className={`mt-1 w-full h-11 rounded-xl border px-3 text-sm uppercase ${errors.postcode ? "border-danger" : "border-line"}`} />
              {errors.postcode && <span className="mt-1 block text-xs text-danger">{errors.postcode}</span>}
            </label>
          </div>
          {addresses.length > 0 &&
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Saved addresses">
              {addresses.map((a) =>
            <button key={a.id} type="button" onClick={() => {setForm({ ...form, name: a.name, line1: a.line1, city: a.city });setPostcode(a.postcode);}} className="h-9 px-3 rounded-lg border border-line text-xs font-semibold text-navy hover:border-navy/40">
                  Use {a.label} · {a.postcode}
                </button>
            )}
            </div>
          }
          {!usedDefault &&
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="h-4 w-4 accent-navy" />Save this address to my account</label>
          }
          <p className="mt-3 text-xs text-muted">Changing your postcode re-checks every seller's delivery options.</p>
        </section>

        <section className="mt-6 bg-white rounded-2xl border border-line p-5 lg:p-6" aria-labelledby="deliv">
          <h2 id="deliv" className="font-bold text-navy">Delivery by seller</h2>
          <ul className="mt-4 divide-y divide-line">
            {summary.groups.map((g) =>
            <li key={g.vendor.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-ink">{g.vendor.name}</p>
                  {g.selected ? <p className="text-muted">{g.selected.method.name} · {g.selected.estimate}</p> : <p className="text-danger">No delivery to {postcode}. <Link to="/cart" className="underline">Edit basket</Link></p>}
                </div>
                <p className="font-bold text-navy">{g.selected ? g.selected.pricePence === 0 ? "Free" : formatPence(g.selected.pricePence) : "—"}</p>
              </li>
            )}
          </ul>
        </section>
      </div>

      <aside className="lg:sticky lg:top-36 self-start bg-white rounded-2xl border border-line p-5" aria-label="Payment summary">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Items</dt><dd>{formatPence(summary.merchandise)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatPence(summary.shipping)}</dd></div>
          <div className="flex justify-between pt-3 border-t border-line text-lg font-extrabold text-navy"><dt>Total</dt><dd>{formatPence(summary.total)}</dd></div>
        </dl>
        <button disabled={submitting || !summary.allShippable} className="mt-5 w-full h-12 rounded-xl bg-gold text-navy font-bold inline-flex items-center justify-center gap-2 disabled:bg-line disabled:text-muted">
          <LockIcon className="h-4 w-4" /> {submitting ? "Creating order…" : `Pay ${formatPence(summary.total)}`}
        </button>
        <p className="mt-3 text-xs text-muted">Card payments are handled by Stripe; VenZorah never stores card numbers. Test mode: no real charge is made and the payment is treated as confirmed.</p>
      </aside>
    </form>);

}