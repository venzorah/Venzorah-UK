import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { CategorySeoDialog } from "../../components/admin/CategorySeoDialog";
import type { Category, CategoryKind, CategoryStatus } from "../../types/marketplace";

const statusTone = { published: "green", draft: "grey", disabled: "gold", archived: "red" } as const;

interface PendingChange {
  category: Category;
  to: CategoryStatus;
}

export function AdminCategories() {
  const { categories, products, services, bookings, setCategoryStatus, createCategory } = usePlatform();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [seoFor, setSeoFor] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ name: "", kind: "service" as CategoryKind, description: "", registeredBusinessOnly: false });

  const impact = (c: Category) => {
    const listings = products.filter((p) => p.categoryId === c.id).length + services.filter((s) => s.categoryId === c.id).length;
    const serviceIds = new Set(services.filter((s) => s.categoryId === c.id).map((s) => s.id));
    const futureBookings = bookings.filter((b) => serviceIds.has(b.serviceId) && new Date(b.start) > new Date() && b.status !== "cancelled").length;
    return { listings, futureBookings };
  };

  const actionsFor = (s: CategoryStatus): {label: string;to: CategoryStatus;}[] => {
    if (s === "draft") return [{ label: "Publish", to: "published" }];
    if (s === "published") return [{ label: "Disable", to: "disabled" }];
    if (s === "disabled") return [{ label: "Restore", to: "published" }, { label: "Archive", to: "archived" }];
    return [];
  };

  const confirm = () => {
    if (!pending || !reason.trim()) return;
    setCategoryStatus(pending.category.id, pending.to, reason.trim());
    toast.success(`${pending.category.name} is now ${pending.to}`);
    setPending(null);
    setReason("");
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Categories</h1>
          <p className="mt-1 text-muted">Changes apply to the marketplace immediately, with no code change or redeploy.</p>
        </div>
        <button onClick={() => setCreating((c) => !c)} className="h-10 px-4 rounded-lg bg-gold text-navy text-sm font-bold inline-flex items-center gap-1.5"><PlusIcon className="h-4 w-4" />New category</button>
      </div>

      {creating &&
      <form
        className="mt-6 bg-white rounded-2xl border border-line p-5 grid md:grid-cols-[1fr_160px_1.5fr_auto] gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newCat.name.trim()) return toast.error("Name is required");
          createCategory(newCat);
          toast.success(`${newCat.name} created as a draft`);
          setNewCat({ name: "", kind: "service", description: "", registeredBusinessOnly: false });
          setCreating(false);
        }}>
        
          <label className="block"><span className="text-xs font-semibold text-muted">Name</span><input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted">Type</span>
            <select value={newCat.kind} onChange={(e) => setNewCat({ ...newCat, kind: e.target.value as CategoryKind })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm bg-white">
              <option value="product">Products</option><option value="service">Bookable services</option>
            </select>
          </label>
          <label className="block"><span className="text-xs font-semibold text-muted">Description</span><input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
          <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Create draft</button>
        </form>
      }

      <div className="mt-6 bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-muted border-b border-line">
            <tr><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Vendor rule</th><th className="px-5 py-3 font-medium">Listings</th><th className="px-5 py-3 font-medium">SEO</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((c) =>
            <tr key={c.id}>
                <td className="px-5 py-3"><p className="font-semibold text-ink">{c.name}</p><p className="text-xs text-muted">/{c.slug}</p></td>
                <td className="px-5 py-3 capitalize">{c.kind}</td>
                <td className="px-5 py-3 text-muted">{c.registeredBusinessOnly ? "Registered businesses only" : "Individuals & businesses"}</td>
                <td className="px-5 py-3">{impact(c).listings}</td>
                <td className="px-5 py-3">{c.seoTitle && c.seoDescription ? <StatusPill tone="green">Set</StatusPill> : <StatusPill tone="gold">Missing</StatusPill>}</td>
                <td className="px-5 py-3"><StatusPill tone={statusTone[c.status]}>{c.status}</StatusPill></td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {c.status !== "archived" &&
                <button onClick={() => setSeoFor(c)} className="h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy hover:border-navy/40">Edit SEO</button>
                }
                  {actionsFor(c.status).map((a) =>
                <button key={a.label} onClick={() => setPending({ category: c, to: a.to })} className="ml-2 h-8 px-3 rounded-lg border border-line text-xs font-semibold text-navy hover:border-navy/40">{a.label}</button>
                )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {pending &&
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setPending(null)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="dlg-title" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-pop">
              <h2 id="dlg-title" className="text-lg font-extrabold text-navy">{pending.to === "published" ? "Publish" : pending.to === "disabled" ? "Disable" : "Archive"} {pending.category.name}?</h2>
              {pending.to === "disabled" &&
            <div className="mt-3 text-sm text-ink space-y-2">
                  <p>It will disappear from navigation, home and search, and new listings and purchases will be blocked.</p>
                  <p className="rounded-lg bg-gold-50 p-3 text-navy">{impact(pending.category).listings} listings hidden · {impact(pending.category).futureBookings} upcoming bookings stay confirmed and need review. Existing orders aren't cancelled.</p>
                </div>
            }
              {pending.to === "published" && <p className="mt-3 text-sm text-ink">Still-approved listings will relist. Vendor eligibility and listing safety are re-checked first.</p>}
              {pending.to === "archived" && <p className="mt-3 text-sm text-ink">Historical orders, bookings and reviews are kept. The category can't be used again.</p>}
              <label className="mt-4 block"><span className="text-sm font-semibold text-ink">Reason (recorded in audit log)</span><input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" /></label>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setPending(null)} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold">Cancel</button>
                <button disabled={!reason.trim()} onClick={confirm} className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-40">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
      <CategorySeoDialog category={seoFor} onClose={() => setSeoFor(null)} />
    </div>);

}