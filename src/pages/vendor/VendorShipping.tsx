import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePlatform } from "../../contexts/PlatformContext";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";
import { formatPence, parsePoundsToPence } from "../../utils/money";
import type { ShippingMethod, ShippingProfile } from "../../types/marketplace";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function VendorShipping() {
  const { updateVendorShipping } = usePlatform();
  const vendor = useCurrentVendor().vendor!;
  const [draft, setDraft] = useState<ShippingProfile>(vendor.shipping);
  const [priceText, setPriceText] = useState<Record<string, string>>({});
  const [thresholdText, setThresholdText] = useState("");
  const [minText, setMinText] = useState("");

  useEffect(() => {
    setMinText((vendor.shipping.minOrderPence / 100).toFixed(2));
    setDraft(vendor.shipping);
    setPriceText(Object.fromEntries(vendor.shipping.methods.map((m) => [m.id, (m.pricePence / 100).toFixed(2)])));
    setThresholdText(vendor.shipping.freeThresholdPence ? (vendor.shipping.freeThresholdPence / 100).toFixed(2) : "");
  }, [vendor.shipping]);

  const patchMethod = (id: string, patch: Partial<ShippingMethod>) =>
  setDraft((d) => ({ ...d, methods: d.methods.map((m) => m.id === id ? { ...m, ...patch } : m) }));

  const save = () => {
    const methods: ShippingMethod[] = [];
    for (const m of draft.methods) {
      const pence = parsePoundsToPence(priceText[m.id] ?? "0");
      if (pence === null) return toast.error(`Enter a valid price for ${m.name}`);
      if (m.deliveryMaxDays < m.deliveryMinDays) return toast.error(`${m.name}: latest delivery must be after earliest`);
      if (m.dispatchDays.length === 0) return toast.error(`${m.name}: choose at least one dispatch day`);
      methods.push({ ...m, pricePence: pence });
    }
    const threshold = thresholdText.trim() ? parsePoundsToPence(thresholdText) : null;
    if (thresholdText.trim() && threshold === null) return toast.error("Enter a valid free-shipping threshold");
    const minOrder = parsePoundsToPence(minText || "0");
    if (minOrder === null) return toast.error("Enter a valid minimum order");
    updateVendorShipping(vendor.id, { ...draft, methods, freeThresholdPence: threshold, minOrderPence: minOrder });
    toast.success("Shipping saved. New quotes use the updated settings; confirmed orders keep theirs.");
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Shipping & delivery</h1>
          <p className="mt-1 text-muted">You ship your own orders. Buyers see these prices and windows before they pay. Profile version {vendor.shipping.version}.</p>
        </div>
        <button onClick={save} className="h-11 px-5 rounded-xl bg-gold text-navy font-bold">Save changes</button>
      </div>

      <section className="mt-6 bg-white rounded-2xl border border-line p-5 grid sm:grid-cols-3 gap-4" aria-label="Order rules">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Free standard delivery over (£)</span>
          <input value={thresholdText} onChange={(e) => setThresholdText(e.target.value)} placeholder="Leave blank for none" className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Minimum order (£)</span>
          <input value={minText} onChange={(e) => setMinText(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Excluded postcode areas</span>
          <input value={draft.excludedAreas.join(", ")} onChange={(e) => setDraft({ ...draft, excludedAreas: e.target.value.toUpperCase().split(/[\s,]+/).filter(Boolean) })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm uppercase" />
        </label>
      </section>

      <div className="mt-6 space-y-4">
        {draft.methods.length === 0 &&
        <div className="bg-white rounded-2xl border border-dashed border-line p-8 text-center">
            <p className="font-semibold text-navy">No delivery methods yet</p>
            <p className="mt-1 text-sm text-muted">Start with standard and express, then adjust prices and coverage.</p>
            <button
            type="button"
            onClick={() => {
              const methods: ShippingMethod[] = [
              { id: `${vendor.id}-std`, name: "Standard", type: "standard", enabled: true, pricePence: 499, processingDays: 1, deliveryMinDays: 2, deliveryMaxDays: 4, cutoff: "14:00", dispatchDays: [1, 2, 3, 4, 5], coverage: "UK" },
              { id: `${vendor.id}-exp`, name: "Express", type: "express", enabled: false, pricePence: 899, processingDays: 0, deliveryMinDays: 1, deliveryMaxDays: 1, cutoff: "12:00", dispatchDays: [1, 2, 3, 4, 5], coverage: [vendor.city === "Sheffield" ? "S" : "B"] }];

              setDraft({ ...draft, methods });
              setPriceText(Object.fromEntries(methods.map((m) => [m.id, (m.pricePence / 100).toFixed(2)])));
            }}
            className="mt-4 h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">
            
              Add standard & express
            </button>
          </div>
        }
        {draft.methods.map((m) =>
        <section key={m.id} className={`bg-white rounded-2xl border p-5 ${m.enabled ? "border-line" : "border-dashed border-line opacity-70"}`} aria-label={m.name}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-navy">{m.name}</p>
                <p className="text-xs text-muted capitalize">{m.type}{m.carrier ? ` · ${m.carrier}` : ""}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <span>{m.enabled ? "Offered" : "Off"}</span>
                <button type="button" role="switch" aria-checked={m.enabled} onClick={() => patchMethod(m.id, { enabled: !m.enabled })} className={`relative h-6 w-11 rounded-full transition-colors duration-150 ${m.enabled ? "bg-navy" : "bg-line"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${m.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <label className="block"><span className="text-xs font-semibold text-muted">Price (£)</span><input value={priceText[m.id] ?? ""} onChange={(e) => setPriceText({ ...priceText, [m.id]: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block"><span className="text-xs font-semibold text-muted">Daily cutoff</span><input type="time" value={m.cutoff} onChange={(e) => patchMethod(m.id, { cutoff: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block"><span className="text-xs font-semibold text-muted">Processing (days)</span><input type="number" min={0} value={m.processingDays} onChange={(e) => patchMethod(m.id, { processingDays: Math.max(0, Number(e.target.value)) })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block"><span className="text-xs font-semibold text-muted">Delivery from (days)</span><input type="number" min={0} value={m.deliveryMinDays} onChange={(e) => patchMethod(m.id, { deliveryMinDays: Math.max(0, Number(e.target.value)) })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block"><span className="text-xs font-semibold text-muted">Delivery to (days)</span><input type="number" min={0} value={m.deliveryMaxDays} onChange={(e) => patchMethod(m.id, { deliveryMaxDays: Math.max(0, Number(e.target.value)) })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <fieldset>
                <legend className="text-xs font-semibold text-muted">Dispatch days</legend>
                <div className="mt-1 flex flex-wrap gap-1">
                  {DAYS.map((d, i) => {
                  const on = m.dispatchDays.includes(i);
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => patchMethod(m.id, { dispatchDays: on ? m.dispatchDays.filter((x) => x !== i) : [...m.dispatchDays, i].sort() })} className={`h-9 w-10 rounded-lg text-xs font-semibold border transition-colors duration-150 ${on ? "bg-navy text-white border-navy" : "bg-white border-line text-ink"}`}>
                        {d}
                      </button>);

                })}
                </div>
              </fieldset>
              <label className="block">
                <span className="text-xs font-semibold text-muted">Coverage (UK for nationwide, or postcode areas)</span>
                <input value={m.coverage === "UK" ? "UK" : m.coverage.join(", ")} onChange={(e) => {const v = e.target.value.toUpperCase().trim();patchMethod(m.id, { coverage: v === "UK" ? "UK" : v.split(/[\s,]+/).filter(Boolean) });}} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm uppercase" />
              </label>
            </div>
            <p className="mt-3 text-xs text-muted">Buyers currently see: {m.enabled ? `${formatPence(parsePoundsToPence(priceText[m.id] ?? "0") ?? 0)}, order by ${m.cutoff}, ${m.deliveryMinDays === m.deliveryMaxDays ? m.deliveryMinDays : `${m.deliveryMinDays}–${m.deliveryMaxDays}`} day(s) after dispatch` : "not offered"}.</p>
          </section>
        )}
      </div>
    </div>);

}