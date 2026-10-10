/** All monetary values are integer pence (GBP minor units). */
export type Pence = number;

export type CategoryStatus = "draft" | "published" | "disabled" | "archived";
export type CategoryKind = "product" | "service" | "logistics";

export interface Category {
  id: string;
  slug: string;
  name: string;
  kind: CategoryKind;
  description: string;
  status: CategoryStatus;
  subcategories: string[];
  showOnHome: boolean;
  registeredBusinessOnly: boolean;
  requiredDocuments: string[];
  image: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type VerificationStatus =
"draft" |
"submitted" |
"in_progress" |
"under_review" |
"action_required" |
"approved" |
"rejected" |
"suspended";

export type ShippingMethodType = "standard" | "express" | "collection" | "local";

export interface ShippingMethod {
  id: string;
  name: string;
  type: ShippingMethodType;
  enabled: boolean;
  pricePence: Pence;
  processingDays: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  cutoff: string; // "HH:mm" Europe/London
  dispatchDays: number[]; // 0 = Sunday
  /** "UK" = UK-wide, otherwise list of postcode areas e.g. ["B", "S", "WV"] */
  coverage: "UK" | string[];
  carrier?: string;
}

export interface ShippingProfile {
  version: number;
  freeThresholdPence: Pence | null;
  minOrderPence: Pence;
  excludedAreas: string[];
  methods: ShippingMethod[];
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  city: "Birmingham" | "Sheffield";
  postcode: string;
  categoryId: string;
  businessType: "limited_company" | "llp" | "sole_trader" | "individual";
  verification: VerificationStatus;
  plan: "free" | "premium" | "services";
  rating: number;
  reviewCount: number;
  initials: string;
  whatsapp?: string;
  email?: string;
  shipping: ShippingProfile;
}

export interface ProductVariant {
  id: string;
  label: string;
  pricePence: Pence;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  vendorId: string;
  categoryId: string;
  subcategory: string;
  image: string;
  description: string;
  variants: ProductVariant[];
  compareAtPence?: Pence;
  ingredients?: string;
  allergens?: string[];
  storage?: string;
  handling?: "ambient" | "chilled" | "frozen";
  moderation: "approved" | "pending" | "rejected";
  rating: number;
  reviewCount: number;
  isNew?: boolean;
}

export interface WeeklyHours {
  day: number; // 0 = Sunday
  open: string;
  close: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  vendorId: string;
  categoryId: string;
  image: string;
  description: string;
  pricePence: Pence;
  durationMin: number;
  bufferMin: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  mode: "premises" | "mobile" | "both";
  premisesAddress?: string;
  serviceAreas: string[];
  travelFeePence: Pence;
  hours: WeeklyHours[];
  staff: string[];
  rating: number;
  reviewCount: number;
  paused: boolean;
  cancellationPolicy: string;
}

export interface PlanPriceVersion {
  id: string;
  monthlyPence: Pence;
  annualPence: Pence;
  effectiveFrom: string; // ISO date
  changedBy: string;
  reason: string;
  status: "live" | "scheduled" | "superseded";
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "retired";
  productCommissionBps: number;
  /** "services" plans are subscription-only: bookings carry no commission. */
  audience: "products" | "services";
  logisticsCommissionBps: number;
  includesLogistics: boolean;
  features: string[];
  subscribers: number;
  prices: PlanPriceVersion[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
}

export interface OrderGroup {
  vendorId: string;
  lines: {productId: string;variantId: string;qty: number;unitPence: Pence;}[];
  merchandisePence: Pence;
  shippingPence: Pence;
  methodName: string;
  methodType: ShippingMethodType;
  estimate: string;
  shippingVersion: number;
  commissionPence: Pence;
  commissionBps: number;
  status: FulfilmentStatus;
  carrier?: string;
  trackingRef?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export type FulfilmentStatus = "awaiting_fulfilment" | "processing" | "dispatched" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerId: string;
  createdAt: string;
  postcode: string;
  groups: OrderGroup[];
  totalPence: Pence;
  paymentStatus: "pending_provider" | "confirmed";
}

export type BookingStatus = "confirmed" | "pending_confirmation" | "completed" | "no_show" | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  start: string; // ISO
  staff: string;
  location: string;
  totalPence: Pence;
  status: BookingStatus;
  completedAt?: string;
}

export type BusinessStructure = "Limited company" | "LLP" | "Sole trader" | "Individual";

export interface ApplicationDocument {
  name: string;
  state: "verified" | "pending" | "missing";
  fileName?: string;
}

export interface VendorApplication {
  id: string;
  userId?: string;
  businessName: string;
  categoryId: string;
  businessType: BusinessStructure;
  companyNumber?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  postcode: string;
  zone: "Birmingham" | "Sheffield" | "Outside approved zones";
  submitted: string;
  status: VerificationStatus;
  documents: ApplicationDocument[];
  flag?: string;
  history: {at: string;status: VerificationStatus;note: string;by: string;}[];
}

export type SettlementStatus = "dispute_window" | "disputed" | "eligible" | "payout_processing" | "paid" | "refunded" | "failed";

export interface Settlement {
  id: string;
  vendorId: string;
  source: "order" | "booking";
  sourceRef: string;
  customerId: string;
  grossPence: Pence;
  commissionPence: Pence;
  netPence: Pence;
  milestone: "Delivered (seller-reported)" | "Service completed";
  milestoneAt: string;
  eligibleAt: string;
  status: SettlementStatus;
  payoutId?: string;
}

export interface Dispute {
  id: string;
  settlementId: string;
  sourceRef: string;
  customerId: string;
  reason: string;
  details: string;
  openedAt: string;
  status: "open" | "refunded" | "released";
  resolutionNote?: string;
}

export interface Payout {
  id: string;
  vendorId: string;
  amountPence: Pence;
  settlementIds: string[];
  createdAt: string;
  status: "processing" | "paid" | "failed";
}

export interface AppNotification {
  id: string;
  audience: string; // user id, or "admin"
  title: string;
  body: string;
  link?: string;
  at: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: "Order" | "Booking" | "Payment" | "Account" | "Privacy request" | "Other";
  reference?: string;
  status: "open" | "awaiting_customer" | "closed";
  createdAt: string;
  messages: {from: "customer" | "support";author: string;body: string;at: string;}[];
}

export interface CmsPage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
  updatedBy: string;
}

export interface HomepageContent {
  foodTitle: string;
  foodText: string;
  foodCta: string;
  servicesTitle: string;
  servicesTags: string[];
  servicesArea: string;
  servicesCta: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  postcode: string;
  isDefault: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}