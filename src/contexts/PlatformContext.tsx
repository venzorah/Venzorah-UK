import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { addDays, subDays } from "date-fns";
import { categories as seedCategories } from "../data/categories";
import { vendors as seedVendors } from "../data/vendors";
import { products as seedProducts } from "../data/products";
import { services as seedServices } from "../data/services";
import { plans as seedPlans, seedAudit } from "../data/plans";
import { applications as seedApplications } from "../data/applications";
import type {
  AuditEntry,
  Booking,
  BookingStatus,
  Category,
  CategoryStatus,
  Order,
  OrderGroup,
  Plan,
  Product,
  Service,
  ShippingProfile,
  Vendor,
  VendorApplication,
  VerificationStatus } from
"../types/marketplace";

interface PlatformState {
  version: number;
  categories: Category[];
  vendors: Vendor[];
  products: Product[];
  services: Service[];
  plans: Plan[];
  orders: Order[];
  bookings: Booking[];
  audit: AuditEntry[];
  applications: VendorApplication[];
  blockedDates: Record<string, string[]>;
  setCategoryStatus: (id: string, status: CategoryStatus, reason: string) => void;
  createCategory: (input: Pick<Category, "name" | "kind" | "description" | "registeredBusinessOnly">) => void;
  updateCategorySeo: (id: string, seoTitle: string, seoDescription: string) => void;
  schedulePlanPrice: (planId: string, monthlyPence: number, annualPence: number, effectiveFrom: string, reason: string) => void;
  updatePlanCommission: (planId: string, patch: Partial<Pick<Plan, "productCommissionBps" | "logisticsCommissionBps" | "includesLogistics">>, reason: string) => void;
  updateVendorShipping: (vendorId: string, profile: ShippingProfile) => void;
  setProductModeration: (productId: string, moderation: Product["moderation"], note: string) => void;
  recordOrder: (order: Order) => void;
  updateOrderGroup: (orderId: string, vendorId: string, patch: Partial<OrderGroup>) => void;
  createBooking: (input: Omit<Booking, "id" | "status">) => {ok: true;booking: Booking;} | {ok: false;error: string;};
  updateBookingStatus: (bookingId: string, status: BookingStatus, actor: string) => void;
  toggleServicePaused: (serviceId: string) => void;
  toggleBlockedDate: (serviceId: string, isoDate: string) => void;
  takenSlots: (serviceId: string) => string[];
  submitApplication: (app: Omit<VendorApplication, "id" | "status" | "submitted" | "history">) => VendorApplication;
  decideApplication: (id: string, status: VerificationStatus, note: string, by: string) => {vendorId?: string;};
}

const PlatformContext = createContext<PlatformState | null>(null);

function at(d: Date, h: number, m = 0) {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
}

function seedBookings(): Booking[] {
  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 2);
  return [
  { id: "BK-1042", customerId: "u-other", serviceId: "s-knotless", start: at(tomorrow, 9), staff: "Tola", location: "Premises", totalPence: 14500, status: "confirmed" },
  { id: "BK-1043", customerId: "u-other", serviceId: "s-deep", start: at(tomorrow, 14), staff: "Amara", location: "S10", totalPence: 7300, status: "confirmed" },
  { id: "BK-1044", customerId: "u-other", serviceId: "s-fade", start: at(tomorrow, 11), staff: "Marcus", location: "Premises", totalPence: 2800, status: "confirmed" },
  { id: "BK-1041", customerId: "u-other", serviceId: "s-knotless", start: at(dayAfter, 10), staff: "Rachel", location: "Premises", totalPence: 14500, status: "confirmed" },
  { id: "BK-1036", customerId: "u-customer", serviceId: "s-knotless", start: at(subDays(new Date(), 2), 10), staff: "Tola", location: "Premises", totalPence: 14500, status: "completed", completedAt: at(subDays(new Date(), 2), 15) }];

}

function seedOrders(): Order[] {
  const placed = subDays(new Date(), 5);
  return [
  {
    id: "VZ-20412",
    customerId: "u-customer",
    createdAt: placed.toISOString(),
    postcode: "B15 1QT",
    totalPence: 2995,
    paymentStatus: "confirmed",
    groups: [
    {
      vendorId: "v-ada",
      lines: [
      { productId: "p-garri", variantId: "p-garri-1kg", qty: 2, unitPence: 549 },
      { productId: "p-palm", variantId: "p-palm-1l", qty: 2, unitPence: 699 }],

      merchandisePence: 2496,
      shippingPence: 499,
      methodName: "Standard tracked",
      methodType: "standard",
      estimate: "Delivered",
      shippingVersion: 3,
      commissionBps: 500,
      commissionPence: 125,
      status: "delivered",
      carrier: "Royal Mail Tracked 48",
      trackingRef: "TT482019334GB",
      dispatchedAt: subDays(new Date(), 4).toISOString(),
      deliveredAt: subDays(new Date(), 3).toISOString()
    }]

  }];

}

export function PlatformProvider({ children }: {children: React.ReactNode;}) {
  const [version, setVersion] = useState(1);
  const [categories, setCategories] = usePersistentState<Category[]>("vz-categories-v5", seedCategories, "session");
  const [vendors, setVendors] = usePersistentState<Vendor[]>("vz-vendors-v4", seedVendors, "session");
  const [products, setProducts] = usePersistentState<Product[]>("vz-products-v3", seedProducts, "session");
  const [services, setServices] = usePersistentState<Service[]>("vz-services-v4", seedServices, "session");
  const [plans, setPlans] = usePersistentState<Plan[]>("vz-plans-v3", seedPlans, "session");
  const [orders, setOrders] = usePersistentState<Order[]>("vz-orders-v3", seedOrders, "session");
  const [bookings, setBookings] = usePersistentState<Booking[]>("vz-bookings-v3", seedBookings, "session");
  const [audit, setAudit] = usePersistentState<AuditEntry[]>("vz-audit-v3", seedAudit, "session");
  const [applications, setApplications] = usePersistentState<VendorApplication[]>("vz-applications-v3", seedApplications, "session");
  const [blockedDates, setBlockedDates] = usePersistentState<Record<string, string[]>>("vz-blocked-v3", {}, "session");

  const bump = () => setVersion((v) => v + 1);
  const log = useCallback((actor: string, action: string, detail: string) => {
    setAudit((a) => [{ id: `a-${Date.now()}-${a.length}`, at: new Date().toISOString(), actor, action, detail }, ...a]);
  }, []);

  const value = useMemo<PlatformState>(
    () => ({
      version,
      categories,
      vendors,
      products,
      services,
      plans,
      orders,
      bookings,
      audit,
      applications,
      blockedDates,
      setCategoryStatus: (id, status, reason) => {
        const cat = categories.find((c) => c.id === id);
        setCategories((cs) => cs.map((c) => c.id === id ? { ...c, status } : c));
        log("Super Admin", `Category ${status}`, `${cat?.name}: ${cat?.status} → ${status}. Reason: ${reason}`);
        bump();
      },
      createCategory: (input) => {
        const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        setCategories((cs) => [
        ...cs,
        { ...input, id: `cat-${slug}`, slug, status: "draft", subcategories: [], showOnHome: false, requiredDocuments: ["Photo ID"], image: seedCategories[3].image }]
        );
        log("Super Admin", "Category created", `${input.name} (draft)`);
        bump();
      },
      updateCategorySeo: (id, seoTitle, seoDescription) => {
        const cat = categories.find((c) => c.id === id);
        setCategories((cs) => cs.map((c) => c.id === id ? { ...c, seoTitle, seoDescription } : c));
        log("Super Admin", "Category SEO updated", `${cat?.name}: title “${cat?.seoTitle ?? "—"}” → “${seoTitle}”`);
        bump();
      },
      schedulePlanPrice: (planId, monthlyPence, annualPence, effectiveFrom, reason) => {
        const today = new Date().toISOString().slice(0, 10);
        const isToday = effectiveFrom <= today;
        setPlans((ps) =>
        ps.map((p) => {
          if (p.id !== planId) return p;
          const prices = p.prices.map((v) =>
          isToday && v.status === "live" ? { ...v, status: "superseded" as const } : !isToday && v.status === "scheduled" ? { ...v, status: "superseded" as const } : v
          );
          return {
            ...p,
            prices: [{ id: `pv-${Date.now()}`, monthlyPence, annualPence, effectiveFrom, changedBy: "Super Admin", reason, status: isToday ? "live" : "scheduled" }, ...prices]
          };
        })
        );
        const plan = plans.find((p) => p.id === planId);
        log("Super Admin", "Plan price scheduled", `${plan?.name}: £${(monthlyPence / 100).toFixed(2)}/mo, £${(annualPence / 100).toFixed(2)}/yr from ${effectiveFrom}. Existing subscribers must accept first. Reason: ${reason}`);
        bump();
      },
      updatePlanCommission: (planId, patch, reason) => {
        setPlans((ps) => ps.map((p) => p.id === planId ? { ...p, ...patch } : p));
        const plan = plans.find((p) => p.id === planId);
        log("Super Admin", "Commission rules updated", `${plan?.name}: ${JSON.stringify(patch)}. New transactions only. Reason: ${reason}`);
        bump();
      },
      updateVendorShipping: (vendorId, profile) => {
        setVendors((vs) => vs.map((v) => v.id === vendorId ? { ...v, shipping: { ...profile, version: v.shipping.version + 1 } } : v));
        const v = vendors.find((x) => x.id === vendorId);
        log(v?.name ?? vendorId, "Shipping profile updated", `Version ${(v?.shipping.version ?? 0) + 1}. Confirmed orders keep their snapshot.`);
        bump();
      },
      setProductModeration: (productId, moderation, note) => {
        const p = products.find((x) => x.id === productId);
        setProducts((ps) => ps.map((x) => x.id === productId ? { ...x, moderation } : x));
        log("Catalogue Moderator", `Listing ${moderation}`, `${p?.name}: ${note}`);
        bump();
      },
      recordOrder: (order) => {
        setOrders((o) => [order, ...o]);
        setProducts((ps) =>
        ps.map((p) => ({
          ...p,
          variants: p.variants.map((v) => {
            const qty = order.groups.flatMap((g) => g.lines).filter((l) => l.variantId === v.id).reduce((s, l) => s + l.qty, 0);
            return qty ? { ...v, stock: Math.max(0, v.stock - qty) } : v;
          })
        }))
        );
        bump();
      },
      updateOrderGroup: (orderId, vendorId, patch) => {
        setOrders((os) => os.map((o) => o.id === orderId ? { ...o, groups: o.groups.map((g) => g.vendorId === vendorId ? { ...g, ...patch } : g) } : o));
        const v = vendors.find((x) => x.id === vendorId);
        if (patch.status) log(v?.name ?? vendorId, `Order ${patch.status.replace("_", " ")}`, `${orderId}${patch.trackingRef ? ` · tracking ${patch.trackingRef}` : ""}`);
        bump();
      },
      createBooking: (input) => {
        const service = services.find((s) => s.id === input.serviceId);
        if (!service) return { ok: false, error: "Service not found" };
        if (service.paused) return { ok: false, error: "This provider has paused new bookings." };
        if ((blockedDates[service.id] ?? []).includes(input.start.slice(0, 10))) return { ok: false, error: "The provider is unavailable that day." };
        const block = (service.durationMin + service.bufferMin) * 60000;
        const start = new Date(input.start).getTime();
        const clash = bookings.some(
          (b) => b.serviceId === input.serviceId && !["cancelled", "no_show"].includes(b.status) && b.staff === input.staff && Math.abs(new Date(b.start).getTime() - start) < block
        );
        if (clash) return { ok: false, error: "That slot was just taken. Please pick another time." };
        const booking: Booking = { ...input, id: `BK-${1045 + bookings.length}`, status: "confirmed" };
        setBookings((bs) => [booking, ...bs]);
        bump();
        return { ok: true, booking };
      },
      updateBookingStatus: (bookingId, status, actor) => {
        setBookings((bs) => bs.map((b) => b.id === bookingId ? { ...b, status, completedAt: status === "completed" ? new Date().toISOString() : b.completedAt } : b));
        log(actor, `Booking ${status.replace("_", " ")}`, bookingId);
        bump();
      },
      toggleServicePaused: (serviceId) => {
        const s = services.find((x) => x.id === serviceId);
        setServices((ss) => ss.map((x) => x.id === serviceId ? { ...x, paused: !x.paused } : x));
        log(vendors.find((v) => v.id === s?.vendorId)?.name ?? "Vendor", s?.paused ? "Bookings resumed" : "Bookings paused", `${s?.name}. Existing confirmed appointments unchanged.`);
        bump();
      },
      toggleBlockedDate: (serviceId, isoDate) => {
        setBlockedDates((bd) => {
          const list = bd[serviceId] ?? [];
          return { ...bd, [serviceId]: list.includes(isoDate) ? list.filter((d) => d !== isoDate) : [...list, isoDate] };
        });
        bump();
      },
      takenSlots: (serviceId) => bookings.filter((b) => b.serviceId === serviceId && !["cancelled", "no_show"].includes(b.status)).map((b) => b.start),
      submitApplication: (input) => {
        const now = new Date().toISOString();
        const app: VendorApplication = {
          ...input,
          id: `APP-${315 + applications.length}`,
          status: "submitted",
          submitted: now.slice(0, 10),
          history: [{ at: now, status: "submitted", note: "Application submitted", by: "Applicant" }]
        };
        setApplications((a) => [app, ...a]);
        log(input.businessName, "Vendor application submitted", `${app.id} · ${input.businessType} · ${input.postcode}`);
        bump();
        return app;
      },
      decideApplication: (id, status, note, by) => {
        const app = applications.find((a) => a.id === id);
        if (!app) return {};
        let vendorId: string | undefined;
        if (status === "approved") {
          vendorId = `v-${id.toLowerCase()}`;
          const initials = app.businessName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          const city = app.zone === "Sheffield" ? "Sheffield" : "Birmingham";
          setVendors((vs) => [
          ...vs,
          {
            id: vendorId!,
            slug: app.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            name: app.businessName,
            city,
            postcode: app.postcode,
            categoryId: app.categoryId,
            businessType: app.businessType === "Limited company" ? "limited_company" : app.businessType === "LLP" ? "llp" : app.businessType === "Sole trader" ? "sole_trader" : "individual",
            verification: "approved",
            plan: categories.find((c) => c.id === app.categoryId)?.kind === "service" ? "services" : "free",
            rating: 0,
            reviewCount: 0,
            initials,
            email: app.contactEmail,
            shipping: { version: 1, freeThresholdPence: null, minOrderPence: 0, excludedAreas: [], methods: [] }
          }]
          );
        }
        setApplications((as) =>
        as.map((a) =>
        a.id === id ?
        {
          ...a,
          status,
          documents: status === "approved" ? a.documents.map((d) => ({ ...d, state: "verified" as const })) : a.documents,
          history: [...a.history, { at: new Date().toISOString(), status, note, by }]
        } :
        a
        )
        );
        log(by, `Application ${status.replace("_", " ")}`, `${app.businessName} (${id}): ${note}`);
        bump();
        return { vendorId };
      }
    }),
    [version, categories, vendors, products, services, plans, orders, bookings, audit, applications, blockedDates, log]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformState {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside PlatformProvider");
  return ctx;
}