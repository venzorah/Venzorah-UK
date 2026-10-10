import type { CmsPage, HomepageContent } from "../types/marketplace";

export const homepageContent: HomepageContent = {
  foodTitle: "Shop African Foods & Groceries Across the UK",
  foodText: "Garri, egusi, palm oil, spices and pantry staples from registered food businesses, delivered to your door.",
  foodCta: "Shop groceries",
  servicesTitle: "Find Trusted Local Services",
  servicesTags: ["Salon", "Spa", "Massage Therapist"],
  servicesArea: "Birmingham & Sheffield",
  servicesCta: "Book a service"
};

const updated = { updatedAt: "2026-10-01T09:00:00", updatedBy: "Super Admin" };

export const cmsPages: CmsPage[] = [
{
  slug: "about",
  title: "About VenZorah",
  body: "VenZorah is a UK marketplace connecting customers with verified African food stores, beauty and hair professionals, massage therapists and spas.\n\n## Where our vendors are\nVendors currently trade from approved areas of Birmingham and Sheffield. Products can be delivered anywhere a seller chooses to ship in the UK.\n\n## How we verify\nEvery vendor is reviewed before they can sell. Food sellers must be registered businesses with food business registration evidence.",
  ...updated
},
{
  slug: "contact",
  title: "Contact us",
  body: "The quickest way to reach us is through Support in your account, where you can track replies.\n\n## Email\nsupport@venzorah.example\n\n## Hours\nMonday to Friday, 9:00–17:30 (UK time).",
  ...updated
},
{
  slug: "faqs",
  title: "Frequently asked questions",
  body: "## Who delivers my order?\nEach seller ships their own items. If you buy from two sellers, you'll receive two deliveries with separate tracking.\n\n## Does messaging a provider book my slot?\nNo. WhatsApp or email contact doesn't reserve a time. Complete your booking on VenZorah to secure it.\n\n## How do service providers pay VenZorah?\nSalons, barbers, massage therapists and spas pay a monthly or annual subscription. There's no commission on bookings, so providers keep 100% of what you pay for your appointment.\n\n## When are sellers paid?\nSeller funds are held for 7 days after delivery or service completion so problems can be raised first.",
  ...updated
},
{
  slug: "terms",
  title: "Terms and conditions",
  body: "These terms govern your use of VenZorah. Contracts for products and services are between you and the vendor; VenZorah operates the marketplace.\n\n## Accounts\nYou're responsible for keeping your login details secure.\n\n## Reviews\nReviews must reflect genuine experiences from completed orders or bookings.\n\nThis text is a starting draft and must be reviewed by qualified UK legal advisers before launch.",
  ...updated
},
{
  slug: "privacy",
  title: "Privacy policy",
  body: "We process personal data under UK GDPR and the Data Protection Act 2018.\n\n## What we collect\nAccount details, delivery addresses, order and booking history, and support conversations.\n\n## Your rights\nYou can request a copy of your data or ask us to delete your account from your account settings.\n\nThis text is a starting draft and must be reviewed by qualified UK legal advisers before launch.",
  ...updated
},
{
  slug: "shipping-returns",
  title: "Shipping, returns and refunds",
  body: "## Shipping\nSellers set their own delivery prices, areas, cutoffs and delivery windows. You'll see these before you pay, and they're locked once your order is confirmed.\n\n## Returns\nUnopened ambient groceries can usually be returned within 14 days. Perishable, chilled and frozen goods can't be returned unless faulty.\n\n## Refunds\nRaise a problem within 7 days of delivery from your orders page. Your statutory consumer rights are not affected.",
  ...updated
},
{
  slug: "cancellations",
  title: "Booking cancellations",
  body: "Each provider sets a cancellation policy shown on the service page before you book.\n\n## Provider changes\nIf a provider pauses bookings, your confirmed appointments still stand. If they need to change one, we'll contact you to reschedule or refund.",
  ...updated
},
{
  slug: "account-deletion",
  title: "Deleting your account",
  body: "You can request deletion from Account → Settings. We'll confirm by email and complete the request within one month.\n\n## What we keep\nWe keep order and payment records for as long as the law requires for tax and accounting purposes.",
  ...updated
}];