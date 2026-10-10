import type { Vendor } from "../types/marketplace";

const weekdays = [1, 2, 3, 4, 5];

export const vendors: Vendor[] = [
{
  id: "v-ada",
  slug: "mama-adas-pantry",
  name: "Mama Ada's Pantry Ltd",
  city: "Birmingham",
  postcode: "B19 3NY",
  categoryId: "cat-food",
  businessType: "limited_company",
  verification: "approved",
  plan: "free",
  rating: 4.8,
  reviewCount: 312,
  initials: "MA",
  whatsapp: "447700900111",
  email: "orders@mamaadas.example",
  shipping: {
    version: 4,
    freeThresholdPence: 4000,
    minOrderPence: 1000,
    excludedAreas: ["BT", "HS", "ZE"],
    methods: [
    { id: "ada-std", name: "Standard tracked", type: "standard", enabled: true, pricePence: 499, processingDays: 1, deliveryMinDays: 2, deliveryMaxDays: 4, cutoff: "14:00", dispatchDays: weekdays, coverage: "UK", carrier: "Royal Mail Tracked 48" },
    { id: "ada-exp", name: "Express", type: "express", enabled: true, pricePence: 899, processingDays: 0, deliveryMinDays: 1, deliveryMaxDays: 1, cutoff: "12:00", dispatchDays: weekdays, coverage: ["B", "CV", "WS", "WV", "DY"], carrier: "DPD Next Day" },
    { id: "ada-col", name: "Collect from store (Aston)", type: "collection", enabled: true, pricePence: 0, processingDays: 0, deliveryMinDays: 0, deliveryMaxDays: 0, cutoff: "16:00", dispatchDays: [1, 2, 3, 4, 5, 6], coverage: ["B"] }]

  }
},
{
  id: "v-steel",
  slug: "steel-city-african-store",
  name: "Steel City African Store Ltd",
  city: "Sheffield",
  postcode: "S2 4SU",
  categoryId: "cat-food",
  businessType: "limited_company",
  verification: "approved",
  plan: "premium",
  rating: 4.7,
  reviewCount: 198,
  initials: "SC",
  email: "hello@steelcityafrican.example",
  shipping: {
    version: 2,
    freeThresholdPence: 5000,
    minOrderPence: 0,
    excludedAreas: ["BT", "IV", "KW", "HS", "ZE"],
    methods: [
    { id: "sc-std", name: "Standard", type: "standard", enabled: true, pricePence: 549, processingDays: 1, deliveryMinDays: 2, deliveryMaxDays: 3, cutoff: "13:00", dispatchDays: weekdays, coverage: "UK", carrier: "Evri" },
    { id: "sc-exp", name: "Express (Yorkshire)", type: "express", enabled: true, pricePence: 999, processingDays: 0, deliveryMinDays: 1, deliveryMaxDays: 1, cutoff: "11:00", dispatchDays: [1, 2, 3, 4], coverage: ["S", "DN", "LS", "WF", "HD", "BD", "DE"], carrier: "Own van" }]

  }
},
{
  id: "v-crown",
  slug: "crown-and-coil-studio",
  name: "Crown & Coil Studio",
  city: "Birmingham",
  postcode: "B5 4BU",
  categoryId: "cat-beauty",
  businessType: "sole_trader",
  verification: "approved",
  plan: "services",
  rating: 4.9,
  reviewCount: 241,
  initials: "CC",
  whatsapp: "447700900222",
  email: "book@crownandcoil.example",
  shipping: { version: 1, freeThresholdPence: null, minOrderPence: 0, excludedAreas: [], methods: [] }
},
{
  id: "v-fade",
  slug: "fade-lab-barbers",
  name: "Fade Lab Barbers",
  city: "Sheffield",
  postcode: "S1 2BJ",
  categoryId: "cat-beauty",
  businessType: "sole_trader",
  verification: "approved",
  plan: "services",
  rating: 4.6,
  reviewCount: 120,
  initials: "FL",
  whatsapp: "447700900333",
  shipping: { version: 1, freeThresholdPence: null, minOrderPence: 0, excludedAreas: [], methods: [] }
},
{
  id: "v-restore",
  slug: "restore-touch-therapy",
  name: "Restore Touch Therapy",
  city: "Sheffield",
  postcode: "S10 2HQ",
  categoryId: "cat-massage",
  businessType: "sole_trader",
  verification: "approved",
  plan: "services",
  rating: 4.9,
  reviewCount: 87,
  initials: "RT",
  email: "hello@restoretouch.example",
  whatsapp: "447700900444",
  shipping: { version: 1, freeThresholdPence: null, minOrderPence: 0, excludedAreas: [], methods: [] }
},
{
  id: "v-iwa",
  slug: "iwa-spa-wellness",
  name: "Ìwà Spa & Wellness Ltd",
  city: "Birmingham",
  postcode: "B3 2PP",
  categoryId: "cat-spa",
  businessType: "limited_company",
  verification: "approved",
  plan: "services",
  rating: 4.8,
  reviewCount: 156,
  initials: "ÌW",
  email: "reception@iwaspa.example",
  shipping: { version: 1, freeThresholdPence: null, minOrderPence: 0, excludedAreas: [], methods: [] }
}];