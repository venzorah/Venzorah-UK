import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangleIcon, CheckIcon, MapPinIcon, UploadIcon } from "lucide-react";
import { usePlatform } from "../../contexts/PlatformContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { zoneForPostcode } from "../../utils/zones";
import { isValidUkPostcode } from "../../utils/shipping";
import { ApplicationStatus } from "../../components/onboarding/ApplicationStatus";
import { Navigate } from "react-router-dom";
import { formatPence } from "../../utils/money";
import { livePrice } from "../../utils/plans";
import type { BusinessStructure } from "../../types/marketplace";

const steps = ["Category", "Business type", "Details", "Location", "Documents", "Agreements"] as const;
const structures: {id: BusinessStructure;text: string;}[] = [
{ id: "Limited company", text: "Registered with Companies House" },
{ id: "LLP", text: "Limited liability partnership" },
{ id: "Sole trader", text: "Self-employed, registered with HMRC" },
{ id: "Individual", text: "Not yet registered as a business" }];

const MAX_FILE = 10 * 1024 * 1024;

export function VendorOnboarding() {
  const { categories, applications, plans, submitApplication } = usePlatform();
  const { user } = useAuth();
  const { notify } = useEngagement();
  const existing = applications.find((a) => a.userId === user?.id);
  const published = categories.filter((c) => c.status === "published");

  const [step, setStep] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [structure, setStructure] = useState<BusinessStructure | "">("");
  const [details, setDetails] = useState({ businessName: "", companyNumber: "", email: user?.email ?? "", phone: "" });
  const [location, setLocation] = useState({ address: "", postcode: "" });
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState({ seller: false, accurate: false, food: false, subscription: false });
  const [error, setError] = useState<string | null>(null);
  const servicePlan = plans.find((p) => p.id === "plan-services");

  if (existing) return <ApplicationStatus app={existing} />;
  if (user?.role === "vendor") return <Navigate to="/vendor" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  const category = categories.find((c) => c.id === categoryId);
  const registeredOnly = !!category?.registeredBusinessOnly;
  const needsCompanyNo = structure === "Limited company" || structure === "LLP";
  const zone = isValidUkPostcode(location.postcode) ? zoneForPostcode(location.postcode) : null;

  const validate = (): string | null => {
    if (step === 0 && !category) return "Choose what you'll sell.";
    if (step === 1) {
      if (!structure) return "Choose your business type.";
      if (registeredOnly && (structure === "Sole trader" || structure === "Individual")) return "Food sellers must be a registered limited company or LLP.";
    }
    if (step === 2) {
      if (details.businessName.trim().length < 2) return "Enter your legal business name.";
      if (needsCompanyNo && !/^[A-Z0-9]{8}$/i.test(details.companyNumber.trim())) return "Companies House numbers are 8 characters, e.g. 14822019.";
      if (!/^\S+@\S+\.\S+$/.test(details.email)) return "Enter a valid business email.";
      if (details.phone.replace(/\D/g, "").length < 10) return "Enter a valid UK phone number.";
    }
    if (step === 3) {
      if (!location.address.trim()) return "Enter your trading address.";
      if (!isValidUkPostcode(location.postcode)) return "Enter a valid UK postcode.";
      if (!zone) return "VenZorah currently approves vendors trading from Birmingham and Sheffield only.";
    }
    if (step === 4) {
      const missing = (category?.requiredDocuments ?? []).filter((d) => !docs[d]);
      if (missing.length) return `Upload: ${missing.join(", ")}`;
    }
    if (step === 5) {
      if (!agree.seller || !agree.accurate) return "Accept the seller agreement and confirm your information.";
      if (registeredOnly && !agree.food) return "Confirm the food safety declaration.";
      if (category?.kind === "service" && !agree.subscription) return "Accept the Service Provider subscription to continue.";
    }
    return null;
  };

  const next = () => {
    const e = validate();
    setError(e);
    if (e) return;
    if (step < steps.length - 1) return setStep(step + 1);
    if (!user || !category || !structure || !zone) return;
    const app = submitApplication({
      userId: user.id,
      businessName: details.businessName.trim(),
      categoryId: category.id,
      businessType: structure,
      companyNumber: needsCompanyNo ? details.companyNumber.trim().toUpperCase() : undefined,
      contactEmail: details.email.trim(),
      contactPhone: details.phone.trim(),
      address: location.address.trim(),
      postcode: location.postcode.toUpperCase(),
      zone,
      documents: category.requiredDocuments.map((d) => ({ name: d, state: "pending" as const, fileName: docs[d] }))
    });
    notify("admin", "New vendor application", `${app.businessName} · ${category.name} · ${app.postcode}`, "/admin");
    notify(user.id, "Application received", `We're reviewing ${app.businessName}. Most checks take 2–3 working days.`, "/sell");
    toast.success("Application submitted");
  };

  const option = (selected: boolean, disabled = false) =>
  `w-full text-left rounded-2xl border p-4 transition-colors duration-150 ${selected ? "border-navy bg-navy-50" : "border-line bg-white hover:border-navy/40"} ${disabled ? "opacity-45 cursor-not-allowed hover:border-line" : ""}`;

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Sell on VenZorah</h1>
      <p className="mt-1 text-muted">For businesses trading from Birmingham or Sheffield. Takes about 10 minutes.</p>

      <ol className="mt-6 flex gap-1.5" aria-label="Progress">
        {steps.map((s, i) =>
        <li key={s} className="flex-1">
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-navy" : "bg-line"}`} />
            <span className={`mt-1.5 hidden sm:block text-xs ${i === step ? "font-semibold text-navy" : "text-muted"}`}>{s}</span>
          </li>
        )}
      </ol>

      <div className="mt-6 bg-white rounded-3xl border border-line p-5 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}>
            {step === 0 &&
            <fieldset>
                <legend className="text-lg font-bold text-navy">What will you sell?</legend>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {published.map((c) =>
                <button key={c.id} type="button" onClick={() => {setCategoryId(c.id);setStructure("");setDocs({});}} aria-pressed={categoryId === c.id} className={option(categoryId === c.id)}>
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="block mt-0.5 text-sm text-muted">{c.registeredBusinessOnly ? "Registered businesses only" : "Individuals and businesses"}</span>
                      <span className="block mt-1 text-xs font-semibold text-navy">
                        {c.kind === "service" && servicePlan ? `Subscription ${formatPence(livePrice(servicePlan).monthlyPence)}/mo · 0% commission` : "Free plan (5% commission) or Premium"}
                      </span>
                    </button>
                )}
                </div>
              </fieldset>
            }

            {step === 1 &&
            <fieldset>
                <legend className="text-lg font-bold text-navy">How is your business set up?</legend>
                {registeredOnly &&
              <p className="mt-3 flex gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy"><AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />Food can only be sold by registered limited companies or LLPs with food business registration.</p>
              }
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {structures.map((s) => {
                  const blocked = registeredOnly && (s.id === "Sole trader" || s.id === "Individual");
                  return (
                    <button key={s.id} type="button" disabled={blocked} onClick={() => setStructure(s.id)} aria-pressed={structure === s.id} className={option(structure === s.id, blocked)}>
                        <span className="block font-semibold text-ink">{s.id}</span>
                        <span className="block mt-0.5 text-sm text-muted">{blocked ? "Not eligible for food" : s.text}</span>
                      </button>);

                })}
                </div>
              </fieldset>
            }

            {step === 2 &&
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-navy">Business details</h2>
                <label className="block"><span className="text-sm font-semibold text-ink">{needsCompanyNo ? "Legal company name" : "Business or trading name"}</span><input value={details.businessName} onChange={(e) => setDetails({ ...details, businessName: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" /></label>
                {needsCompanyNo && <label className="block"><span className="text-sm font-semibold text-ink">Companies House number</span><input value={details.companyNumber} onChange={(e) => setDetails({ ...details, companyNumber: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm uppercase" /></label>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block"><span className="text-sm font-semibold text-ink">Business email</span><input type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" /></label>
                  <label className="block"><span className="text-sm font-semibold text-ink">Phone</span><input type="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" /></label>
                </div>
              </div>
            }

            {step === 3 &&
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-navy">Where do you trade from?</h2>
                <label className="block"><span className="text-sm font-semibold text-ink">Trading address</span><input value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" /></label>
                <label className="block"><span className="text-sm font-semibold text-ink">Postcode</span><input value={location.postcode} onChange={(e) => setLocation({ ...location, postcode: e.target.value })} className="mt-1 w-full sm:w-48 h-11 rounded-xl border border-line px-3 text-sm uppercase" /></label>
                {isValidUkPostcode(location.postcode) &&
              <p className={`flex items-center gap-2 text-sm font-semibold ${zone ? "text-success" : "text-danger"}`}>
                    <MapPinIcon className="h-4 w-4" />{zone ? `Inside the approved ${zone} zone` : "Outside approved zones. We'll let you know when we expand."}
                  </p>
              }
              </div>
            }

            {step === 4 &&
            <div>
                <h2 className="text-lg font-bold text-navy">Upload documents</h2>
                <p className="mt-1 text-sm text-muted">PDF, JPG or PNG up to 10 MB. Stored securely and only seen by verification staff.</p>
                <ul className="mt-4 space-y-2">
                  {category?.requiredDocuments.map((d) =>
                <li key={d} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                      <span className="text-sm font-semibold text-ink">{d}</span>
                      <label className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer ${docs[d] ? "bg-green-50 text-success" : "border border-line text-navy"}`}>
                        {docs[d] ? <CheckIcon className="h-4 w-4" /> : <UploadIcon className="h-4 w-4" />}
                        <span className="max-w-[160px] truncate">{docs[d] ?? "Choose file"}</span>
                        <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > MAX_FILE) return toast.error("Files must be 10 MB or smaller");
                        setDocs({ ...docs, [d]: f.name });
                      }} />
                    
                      </label>
                    </li>
                )}
                </ul>
              </div>
            }

            {step === 5 &&
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-navy">Agreements</h2>
                <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={agree.seller} onChange={(e) => setAgree({ ...agree, seller: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" /><span>I accept the VenZorah seller agreement, including the 7-day post-fulfilment settlement policy.</span></label>
                {category?.kind === "service" && servicePlan &&
              <label className="flex items-start gap-3 text-sm rounded-xl bg-navy-50 p-3">
                    <input type="checkbox" checked={agree.subscription} onChange={(e) => setAgree({ ...agree, subscription: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" />
                    <span>
                      I agree to the <strong>{servicePlan.name}</strong> subscription at {formatPence(livePrice(servicePlan).monthlyPence)}/month (or {formatPence(livePrice(servicePlan).annualPence)}/year), billed once approved. Services carry no commission — I keep 100% of each booking.
                    </span>
                  </label>
              }
                <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={agree.accurate} onChange={(e) => setAgree({ ...agree, accurate: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" /><span>The information and documents I've provided are accurate, and I'm authorised to act for this business.</span></label>
                {registeredOnly &&
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={agree.food} onChange={(e) => setAgree({ ...agree, food: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" /><span>My business is registered with the local authority as a food business, and I'll provide accurate ingredient, allergen and storage information for every product.</span></label>
              }
              </div>
            }
          </motion.div>
        </AnimatePresence>

        {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
        <div className="mt-8 flex justify-between gap-3">
          <button type="button" onClick={() => {setError(null);setStep(Math.max(0, step - 1));}} disabled={step === 0} className="h-11 px-5 rounded-xl border border-line text-sm font-semibold text-navy disabled:opacity-0">Back</button>
          <button type="button" onClick={next} className="h-11 px-6 rounded-xl bg-gold text-navy text-sm font-bold">{step === steps.length - 1 ? "Submit application" : "Continue"}</button>
        </div>
      </div>
    </div>);

}