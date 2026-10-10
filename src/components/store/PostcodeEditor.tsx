import React, { useState } from "react";
import { MapPinIcon } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { isValidUkPostcode } from "../../utils/shipping";

/** Inline "Deliver to" postcode control. Changing it re-quotes every seller's shipping. */
export function PostcodeEditor() {
  const { postcode, setPostcode } = useCart();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(postcode);
  const valid = isValidUkPostcode(draft);

  if (editing) {
    return (
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          setPostcode(draft.toUpperCase().trim());
          setEditing(false);
        }}>
        
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          aria-label="Delivery postcode"
          aria-invalid={!valid}
          className={`w-28 h-9 rounded-lg border px-2 text-sm uppercase bg-white ${valid ? "border-line" : "border-danger"}`} />
        
        <button disabled={!valid} className="h-9 px-3 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-40">Save</button>
        <button type="button" onClick={() => setEditing(false)} className="h-9 px-2 text-sm text-muted">Cancel</button>
      </form>);

  }

  return (
    <button
      onClick={() => {
        setDraft(postcode);
        setEditing(true);
      }}
      className="flex items-center gap-2 text-left rounded-lg px-2 py-1 hover:bg-surface"
      aria-label={`Delivering to ${postcode}. Change postcode`}>
      
      <MapPinIcon className="h-4 w-4 text-navy shrink-0" />
      <span className="leading-tight">
        <span className="block text-[11px] text-muted">Deliver to</span>
        <span className="block text-sm font-semibold text-navy whitespace-nowrap">{postcode}</span>
      </span>
    </button>);

}