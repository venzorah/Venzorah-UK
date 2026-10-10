import React from "react";
import { Link } from "react-router-dom";
import { ClockIcon, MapPinIcon, StarIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { formatPence } from "../../utils/money";
import { SaveButton } from "./SaveButton";
import type { Service } from "../../types/marketplace";

export function ServiceCard({ service }: {service: Service;}) {
  const { vendors } = usePlatform();
  const vendor = vendors.find((v) => v.id === service.vendorId);
  return (
    <article className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-line hover:border-navy/30 transition-colors duration-150">
      <Link to={`/s/${service.slug}`} className="flex flex-col flex-1">
        <div className="aspect-[4/3] overflow-hidden bg-surface relative">
          <img src={service.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
          {service.paused && <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white text-ink text-[11px] font-bold">Not taking bookings</span>}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <p className="text-xs text-muted truncate">{vendor?.name} · {vendor?.city}</p>
          <h3 className="mt-1 font-semibold text-ink leading-snug line-clamp-2 min-h-[2.75rem]">{service.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{service.durationMin >= 60 ? `${service.durationMin / 60} hr` : `${service.durationMin} min`}</span>
            <span className="inline-flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5" />{service.mode === "mobile" ? "Comes to you" : service.mode === "both" ? "Premises or mobile" : "At premises"}</span>
            <span className="inline-flex items-center gap-1"><StarIcon className="h-3.5 w-3.5 fill-gold text-gold" />{service.rating.toFixed(1)}</span>
          </div>
          <p className="mt-auto pt-3 text-base font-bold text-navy">From {formatPence(service.pricePence)}</p>
        </div>
      </Link>
      <SaveButton id={service.id} name={service.name} className="absolute top-2.5 right-2.5" />
    </article>);

}