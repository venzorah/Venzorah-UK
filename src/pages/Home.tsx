import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, MapPinIcon, TruckIcon } from "lucide-react";
import { useCms } from "../contexts/CmsContext";
import { images } from "../data/images";

export function Home() {
  const { homepage } = useCms();

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-4 lg:py-6 flex flex-col md:min-h-[calc(100vh-8.5rem)]">
      <h1 className="sr-only">VenZorah — Shop Products and Services</h1>
      <section className="flex-1 grid md:grid-cols-2 gap-4 lg:gap-5" aria-label="Choose what you're looking for">
        <Link to="/browse?view=products" className="group relative flex flex-col overflow-hidden rounded-3xl bg-navy text-white min-h-[340px]">
          <div className="relative flex-1 min-h-[180px] overflow-hidden">
            <img src={images.hero} alt="African grocery essentials including garri, palm oil, plantain and peppers" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 h-8 text-xs font-bold text-navy">
              <TruckIcon className="h-3.5 w-3.5" /> UK-wide delivery
            </span>
          </div>
          <div className="flex flex-col p-6 lg:p-8">
            <h2 className="text-2xl lg:text-[2rem] font-extrabold leading-tight tracking-tight">{homepage.foodTitle}</h2>
            <p className="mt-3 text-white/75 max-w-md">{homepage.foodText}</p>
            <span className="mt-6 inline-flex items-center gap-2 self-start h-12 px-6 rounded-xl bg-gold text-navy font-bold transition-transform duration-150 ease-out group-active:scale-[0.98]">
              {homepage.foodCta} <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        <Link to="/browse?view=services" className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-line min-h-[340px]">
          <div className="relative flex-1 min-h-[180px] overflow-hidden grid grid-cols-3 gap-0.5 bg-line">
            {[images.salon, images.barber, images.nails].map((src) =>
            <div key={src} className="relative overflow-hidden">
                <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
            )}
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 h-8 text-xs font-bold text-white">
              <MapPinIcon className="h-3.5 w-3.5 text-gold" /> {homepage.servicesArea}
            </span>
          </div>
          <div className="flex flex-col p-6 lg:p-8">
            <h2 className="text-2xl lg:text-[2rem] font-extrabold leading-tight tracking-tight text-navy">{homepage.servicesTitle}</h2>
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink font-semibold" aria-label="Service types">
              {homepage.servicesTags.map((t) =>
              <li key={t} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  {t}
                </li>
              )}
            </ul>
            <p className="mt-2 text-muted">Verified providers in {homepage.servicesArea}.</p>
            <span className="mt-6 inline-flex items-center gap-2 self-start h-12 px-6 rounded-xl bg-navy text-white font-bold transition-transform duration-150 ease-out group-active:scale-[0.98]">
              {homepage.servicesCta} <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </section>
    </div>);

}