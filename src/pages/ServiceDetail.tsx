import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDays, format, isSameDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2Icon, ClockIcon, MapPinIcon, StarIcon } from "lucide-react";
import { usePublicCatalog } from "../hooks/useCatalog";
import { usePlatform } from "../contexts/PlatformContext";
import { generateSlots } from "../utils/slots";
import { formatPence } from "../utils/money";
import { isValidUkPostcode, postcodeDistrict } from "../utils/shipping";
import { ContactProvider } from "../components/store/ContactProvider";
import { SaveButton } from "../components/store/SaveButton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../contexts/AuthContext";
import { useEngagement } from "../contexts/EngagementContext";
import type { Booking } from "../types/marketplace";

export function ServiceDetail() {
  const { slug } = useParams();
  const { services } = usePublicCatalog();
  const { vendors, takenSlots, blockedDates, createBooking } = usePlatform();
  const { user, userIdForVendor } = useAuth();
  const { notify } = useEngagement();
  const navigate = useNavigate();
  const service = services.find((s) => s.slug === slug);
  const [day, setDay] = useState(() => addDays(new Date(), 1));
  const [staff, setStaff] = useState<string>("");
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);
  usePageMeta(service ? `${service.name} | Book Online | VenZorah` : undefined, service ? service.description.slice(0, 155) : undefined);

  if (!service) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Service not available</h1>
        <Link to="/browse?view=services" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">See other services</Link>
      </div>);

  }

  const vendor = vendors.find((v) => v.id === service.vendorId)!;
  const chosenStaff = staff || service.staff[0];
  const taken = takenSlots(service.id);
  const slots = generateSlots(service, day, taken, blockedDates[service.id] ?? []);
  const isMobile = service.mode === "mobile";
  const district = postcodeDistrict(postcode);
  const pcValid = isValidUkPostcode(postcode);
  const inArea = !isMobile || pcValid && service.serviceAreas.includes(district);
  const total = service.pricePence + (isMobile ? service.travelFeePence : 0);

  const confirm = () => {
    setError(null);
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/s/${service.slug}`)}`);
      return;
    }
    if (!slotIso) return setError("Choose a time.");
    if (isMobile && !pcValid) return setError("Enter a valid UK postcode for the appointment address.");
    if (!inArea) return setError(`${vendor.name} doesn't cover ${district}. Covered areas: ${service.serviceAreas.join(", ")}.`);
    setSubmitting(true);
    setTimeout(() => {
      const result = createBooking({ customerId: user.id, serviceId: service.id, start: slotIso, staff: chosenStaff, location: isMobile ? postcode.toUpperCase() : "Premises", totalPence: total });
      setSubmitting(false);
      if (result.ok) {
        setConfirmed(result.booking);
        const when = format(new Date(result.booking.start), "EEE d MMM, HH:mm");
        notify(user.id, "Booking confirmed", `${service.name} with ${result.booking.staff}, ${when}. Ref ${result.booking.id}.`, "/account?tab=bookings");
        notify(userIdForVendor(vendor.id), "New booking", `${service.name} · ${when} · ${result.booking.staff}`, "/vendor/calendar");
      } else {
        setError(result.error);
        setSlotIso(null);
      }
    }, 400);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-10 grid lg:grid-cols-[1fr_440px] gap-8 lg:gap-12">
      <div>
        <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-white">
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        </div>
        <Link to={`/browse?vendor=${vendor.slug}`} className="mt-6 inline-block text-sm font-semibold text-navy hover:underline">{vendor.name}</Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">{service.name}</h1>
          <SaveButton id={service.id} name={service.name} className="mt-1 shrink-0" />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><ClockIcon className="h-4 w-4" />{service.durationMin} minutes</span>
          <span className="inline-flex items-center gap-1.5"><MapPinIcon className="h-4 w-4" />{isMobile ? `Mobile · ${service.serviceAreas.slice(0, 5).join(", ")}${service.serviceAreas.length > 5 ? "…" : ""}` : service.premisesAddress}</span>
          <span className="inline-flex items-center gap-1.5"><StarIcon className="h-4 w-4 fill-gold text-gold" />{service.rating} ({service.reviewCount})</span>
        </div>
        <p className="mt-6 text-ink/80 leading-relaxed max-w-2xl">{service.description}</p>
        <div className="mt-8 max-w-2xl">
          <h2 className="font-bold text-navy">Cancellation policy</h2>
          <p className="mt-1 text-sm text-ink/80">{service.cancellationPolicy}</p>
        </div>
        <div className="mt-8 max-w-2xl"><ContactProvider vendor={vendor} subject={service.name} /></div>
      </div>

      <aside className="lg:sticky lg:top-36 self-start bg-white rounded-3xl border border-line p-5 lg:p-6 shadow-card" aria-label="Book this service">
        <AnimatePresence mode="wait">
          {confirmed ?
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} className="text-center py-6">
              <CheckCircle2Icon className="mx-auto h-12 w-12 text-success" />
              <h2 className="mt-3 text-xl font-extrabold text-navy">Booking confirmed</h2>
              <p className="mt-1 text-sm text-muted">{format(new Date(confirmed.start), "EEEE d MMMM, HH:mm")} with {confirmed.staff}</p>
              <p className="mt-1 text-sm text-muted">Reference {confirmed.id}</p>
              <Link to="/account?tab=bookings" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">View my bookings</Link>
            </motion.div> :

          <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="text-2xl font-extrabold text-navy">{formatPence(service.pricePence)}</p>
              {isMobile && service.travelFeePence > 0 && <p className="text-xs text-muted">+ {formatPence(service.travelFeePence)} travel fee</p>}

              {service.paused ?
            <p className="mt-6 rounded-xl bg-surface p-4 text-sm text-ink">This provider has paused new bookings. Existing appointments are unaffected.</p> :

            <>
                  {service.staff.length > 1 &&
              <label className="mt-5 block">
                      <span className="text-sm font-semibold text-ink">With</span>
                      <select value={chosenStaff} onChange={(e) => {setStaff(e.target.value);setSlotIso(null);}} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm bg-white">
                        {service.staff.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
              }

                  <p className="mt-5 text-sm font-semibold text-ink">Date</p>
                  <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                    {days.map((d) => {
                  const open = service.hours.some((h) => h.day === d.getDay());
                  const active = isSameDay(d, day);
                  return (
                    <button key={d.toISOString()} disabled={!open} onClick={() => {setDay(d);setSlotIso(null);}} aria-pressed={active} className={`shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center transition-colors duration-150 ${active ? "bg-navy border-navy text-white" : "bg-white border-line text-ink hover:border-navy/40"} disabled:opacity-35`}>
                          <span className="text-[11px] font-medium">{format(d, "EEE")}</span>
                          <span className="text-lg font-bold leading-none mt-0.5">{format(d, "d")}</span>
                        </button>);

                })}
                  </div>

                  <p className="mt-5 text-sm font-semibold text-ink">Time <span className="font-normal text-muted">(UK time)</span></p>
                  {slots.filter((s) => s.available).length === 0 ?
              <p className="mt-2 text-sm text-muted">No availability on this day. Try another date.</p> :

              <div className="mt-2 grid grid-cols-4 gap-2">
                      {slots.map((s) =>
                <button key={s.iso} disabled={!s.available} onClick={() => setSlotIso(s.iso)} aria-pressed={slotIso === s.iso} className={`h-10 rounded-lg border text-sm font-semibold transition-colors duration-150 ${slotIso === s.iso ? "bg-gold border-gold text-navy" : "bg-white border-line text-ink hover:border-navy/40"} disabled:bg-surface disabled:text-muted/60 disabled:line-through disabled:border-transparent`}>
                          {s.label}
                        </button>
                )}
                    </div>
              }

                  {isMobile &&
              <label className="mt-5 block">
                      <span className="text-sm font-semibold text-ink">Appointment postcode</span>
                      <input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. S10 2HQ" className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm uppercase" />
                      {pcValid && !inArea && <span className="mt-1 block text-xs text-danger">Outside this provider's area.</span>}
                    </label>
              }

                  {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-muted">Total</span>
                    <span className="font-extrabold text-navy text-lg">{formatPence(total)}</span>
                  </div>
                  <button onClick={confirm} disabled={submitting || !!user && !slotIso} className="mt-3 w-full h-12 rounded-xl bg-gold text-navy font-bold transition-transform duration-150 ease-out active:scale-[0.98] disabled:bg-line disabled:text-muted">
                    {submitting ? "Checking availability…" : user ? "Confirm booking" : "Sign in to book"}
                  </button>
                  <p className="mt-2 text-[11px] text-muted text-center">Slot is re-checked when you confirm. Payment is taken by the provider-approved processor.</p>
                </>
            }
            </motion.div>
          }
        </AnimatePresence>
      </aside>
    </div>);

}