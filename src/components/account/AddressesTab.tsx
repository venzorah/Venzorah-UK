import React, { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useCustomer } from "../../contexts/CustomerContext";
import { isValidUkPostcode } from "../../utils/shipping";
import { StatusPill } from "../dashboard/StatusPill";
import type { SavedAddress } from "../../types/marketplace";

const empty = { label: "Home", name: "", line1: "", city: "", postcode: "", isDefault: false };

export function AddressesTab() {
  const { addresses, saveAddress, removeAddress, setDefaultAddress } = useCustomer();
  const [editing, setEditing] = useState<(Omit<SavedAddress, "id"> & {id?: string;}) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const next: Record<string, string> = {};
    if (!editing.name.trim()) next.name = "Required";
    if (!editing.line1.trim()) next.line1 = "Required";
    if (!editing.city.trim()) next.city = "Required";
    if (!isValidUkPostcode(editing.postcode)) next.postcode = "Enter a valid UK postcode";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveAddress({ ...editing, postcode: editing.postcode.toUpperCase() });
    toast.success("Address saved");
    setEditing(null);
  };

  const input = (k: keyof typeof empty, label: string) =>
  <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input value={String(editing?.[k] ?? "")} onChange={(e) => editing && setEditing({ ...editing, [k]: e.target.value })} className={`mt-1 w-full h-10 rounded-lg border px-3 text-sm ${errors[k] ? "border-danger" : "border-line"}`} />
      {errors[k] && <span className="text-xs text-danger">{errors[k]}</span>}
    </label>;


  return (
    <div className="mt-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((a) =>
        <div key={a.id} className="bg-white rounded-2xl border border-line p-5 flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">{a.label}</p>
              {a.isDefault && <StatusPill tone="navy">Default</StatusPill>}
            </div>
            <p className="mt-2 text-sm text-ink/80">{a.name}<br />{a.line1}<br />{a.city} {a.postcode}</p>
            <div className="mt-auto pt-4 flex gap-3 text-sm font-semibold">
              <button onClick={() => setEditing(a)} className="text-navy underline">Edit</button>
              {!a.isDefault && <button onClick={() => setDefaultAddress(a.id)} className="text-navy underline">Make default</button>}
              <button onClick={() => {removeAddress(a.id);toast("Address removed");}} className="text-danger underline">Remove</button>
            </div>
          </div>
        )}
        {!editing &&
        <button onClick={() => {setErrors({});setEditing(empty);}} className="rounded-2xl border border-dashed border-line p-5 min-h-[150px] flex flex-col items-center justify-center text-navy font-semibold hover:border-navy/40">
            <PlusIcon className="h-5 w-5" /> Add address
          </button>
        }
      </div>
      {editing &&
      <form onSubmit={submit} className="mt-4 bg-white rounded-2xl border border-line p-5 grid sm:grid-cols-2 gap-3" aria-label="Address form">
          {input("label", "Label (e.g. Home, Work)")}
          {input("name", "Recipient name")}
          <div className="sm:col-span-2">{input("line1", "Address")}</div>
          {input("city", "Town or city")}
          {input("postcode", "Postcode")}
          <label className="sm:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} className="h-4 w-4 accent-navy" />Use as default delivery address</label>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold">Cancel</button>
            <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Save address</button>
          </div>
        </form>
      }
    </div>);

}