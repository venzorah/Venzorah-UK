import type { Category } from "../types/marketplace";
import { images } from "./images";

export const categories: Category[] = [
{
  id: "cat-food",
  slug: "african-foods",
  name: "African Foods Hub",
  seoTitle: "African Food Shop UK | Groceries Online | VenZorah",
  seoDescription: "Shop African groceries online in the UK. Garri, egusi, palm oil, spices and pantry staples from registered food businesses, delivered to your door.",
  kind: "product",
  description: "Groceries, grains, spices and pantry staples from registered UK food businesses.",
  status: "published",
  subcategories: ["Grains & cereals", "Flours & swallow", "Garri", "Cooking ingredients", "Spices & seasonings", "Palm & cooking oils", "Snacks", "Drinks"],
  showOnHome: true,
  registeredBusinessOnly: true,
  requiredDocuments: ["Companies House record", "Food business registration", "Food hygiene certificate", "Allergen procedure"],
  image: images.hero
},
{
  id: "cat-beauty",
  slug: "beauty-hair",
  name: "Beauty & Hair",
  seoTitle: "Beauty & Hair Services UK | VenZorah",
  seoDescription: "Book trusted hair salons, braiders, barbers and nail technicians in Birmingham and Sheffield. See live availability and book your appointment online.",
  kind: "service",
  description: "Braiding, salons, barbering and hair care from verified stylists.",
  status: "published",
  subcategories: ["Braiding", "Salon", "Barbering", "Wigs & installs"],
  showOnHome: true,
  registeredBusinessOnly: false,
  requiredDocuments: ["Photo ID", "Public liability insurance"],
  image: images.braids
},
{
  id: "cat-massage",
  slug: "massage-therapy",
  name: "Massage Therapy",
  seoTitle: "Massage Therapists UK | Book Online | VenZorah",
  seoDescription: "Book qualified massage therapists online in Birmingham and Sheffield. Deep tissue, Swedish and sports massage at their premises or in your home.",
  kind: "service",
  description: "Qualified therapists at their premises or at your home.",
  status: "published",
  subcategories: ["Deep tissue", "Swedish", "Sports", "Pregnancy"],
  showOnHome: true,
  registeredBusinessOnly: false,
  requiredDocuments: ["Photo ID", "Professional qualification", "Insurance certificate"],
  image: images.massage
},
{
  id: "cat-spa",
  slug: "spas-wellness",
  name: "Spas & Wellness",
  seoTitle: "Spas & Wellness Services UK | VenZorah",
  seoDescription: "Discover spas, facials, manicures and wellness treatments from verified providers in Birmingham and Sheffield. Compare prices and book online.",
  kind: "service",
  description: "Facials, packages and wellness treatments.",
  status: "published",
  subcategories: ["Facials", "Packages", "Body treatments"],
  showOnHome: true,
  registeredBusinessOnly: false,
  requiredDocuments: ["Business registration", "Insurance certificate"],
  image: images.spa
},
{
  id: "cat-cleaning",
  slug: "home-cleaning",
  name: "Home Cleaning",
  kind: "service",
  description: "Domestic and end-of-tenancy cleaning.",
  status: "draft",
  subcategories: ["Domestic", "End of tenancy"],
  showOnHome: false,
  registeredBusinessOnly: false,
  requiredDocuments: ["Photo ID", "Public liability insurance", "DBS check"],
  image: images.spa
}];