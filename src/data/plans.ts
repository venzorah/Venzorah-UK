import type { AuditEntry, Plan } from "../types/marketplace";

export const plans: Plan[] = [
{
  id: "plan-free",
  name: "Free",
  audience: "products",
  description: "Sell products with no monthly fee. 5% commission on product sales (shipping excluded).",
  status: "active",
  productCommissionBps: 500,
  logisticsCommissionBps: 800,
  includesLogistics: false,
  features: ["Unlimited product listings (fair use)", "Standard storefront", "Email support"],
  subscribers: 312,
  prices: [
  { id: "pf-1", monthlyPence: 0, annualPence: 0, effectiveFrom: "2026-01-01", changedBy: "System seed", reason: "Launch default", status: "live" }]

},
{
  id: "plan-premium",
  name: "Premium",
  audience: "products",
  description: "0% commission on covered product sales.",
  status: "active",
  productCommissionBps: 0,
  logisticsCommissionBps: 800,
  includesLogistics: false,
  features: ["0% commission on covered products", "Featured placement eligibility", "Priority support", "Advanced reports"],
  subscribers: 61,
  prices: [
  { id: "pp-1", monthlyPence: 3900, annualPence: 46800, effectiveFrom: "2026-01-01", changedBy: "System seed", reason: "Launch default", status: "live" }]

},
{
  id: "plan-services",
  name: "Service Provider",
  audience: "services",
  description: "Subscription for salons, barbers, massage therapists and spas. No commission on bookings.",
  status: "active",
  productCommissionBps: 0,
  logisticsCommissionBps: 0,
  includesLogistics: false,
  features: ["0% commission on every booking", "Booking calendar & availability controls", "Unlimited services and staff", "WhatsApp & email contact buttons", "Priority support"],
  subscribers: 135,
  prices: [
  { id: "ps-1", monthlyPence: 2499, annualPence: 24990, effectiveFrom: "2026-01-01", changedBy: "System seed", reason: "Launch default", status: "live" }]

}];


export const seedAudit: AuditEntry[] = [
{ id: "a-1", at: "2026-10-08T15:12:00", actor: "Grace O. (Verification Officer)", action: "Vendor approved", detail: "Ìwà Spa & Wellness Ltd — insurance verified" },
{ id: "a-2", at: "2026-10-08T11:40:00", actor: "Daniel K. (Catalogue Moderator)", action: "Listing sent back", detail: "Palm Oil — Family Size: allergen statement missing" },
{ id: "a-3", at: "2026-10-07T09:05:00", actor: "Super Admin", action: "Zone updated", detail: "Sheffield: added S17 to eligible trading postcodes" }];