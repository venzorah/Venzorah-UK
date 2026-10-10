import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useFinance } from "../../contexts/FinanceContext";
import { useEngagement } from "../../contexts/EngagementContext";

const reasons = ["Item not received", "Damaged or faulty", "Wrong item", "Service not as described", "Provider didn't attend", "Other"];

interface DisputeDialogProps {
  open: boolean;
  sourceRef: string;
  customerId: string;
  vendorId?: string;
  vendorUserId?: string;
  onClose: () => void;
}

export function DisputeDialog({ open, sourceRef, customerId, vendorId, vendorUserId, onClose }: DisputeDialogProps) {
  const { openDispute } = useFinance();
  const { notify } = useEngagement();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = openDispute(sourceRef, customerId, reason, details, vendorId);
    if (!r.ok) return setError(r.error);
    notify(customerId, `Problem reported for ${sourceRef}`, "We've paused the seller's payment while we review. We'll reply within 2 working days.", "/account");
    notify(vendorUserId, `Dispute opened on ${sourceRef}`, `${reason}. Funds for this transaction are on hold.`, "/vendor/payouts");
    notify("admin", `New dispute: ${sourceRef}`, reason, "/admin/finance");
    toast.success("Problem reported. Seller funds are on hold.");
    setDetails("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open &&
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
          <motion.form
          onSubmit={submit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dsp-title"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-pop">
          
            <h2 id="dsp-title" className="text-lg font-extrabold text-navy">Report a problem with {sourceRef}</h2>
            <p className="mt-1 text-sm text-muted">Available for 7 days after delivery or completion. Your statutory rights are unaffected.</p>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">What went wrong?</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm bg-white">
                {reasons.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Details</span>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" placeholder="Tell us what happened. You can add photos when support replies." />
            </label>
            {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold">Cancel</button>
              <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Submit</button>
            </div>
          </motion.form>
        </motion.div>
      }
    </AnimatePresence>);

}