import React from "react";
import { MailIcon, MessageCircleIcon } from "lucide-react";
import type { Vendor } from "../../types/marketplace";

export function ContactProvider({ vendor, subject }: {vendor: Vendor;subject: string;}) {
  if (!vendor.whatsapp && !vendor.email) return null;
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="text-sm font-semibold text-navy">Questions for {vendor.name}?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {vendor.whatsapp &&
        <a href={`https://wa.me/${vendor.whatsapp}?text=${encodeURIComponent(`Hi, I found you on VenZorah — ${subject}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-line text-sm font-semibold text-ink hover:border-navy/40">
            <MessageCircleIcon className="h-4 w-4 text-success" /> WhatsApp
          </a>
        }
        {vendor.email &&
        <a href={`mailto:${vendor.email}?subject=${encodeURIComponent(`VenZorah enquiry: ${subject}`)}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-line text-sm font-semibold text-ink hover:border-navy/40">
            <MailIcon className="h-4 w-4 text-navy" /> Email
          </a>
        }
      </div>
      <p className="mt-3 text-xs text-muted">Contacting this provider does not confirm or reserve an appointment. Complete your booking on VenZorah to secure an available slot.</p>
    </div>);

}