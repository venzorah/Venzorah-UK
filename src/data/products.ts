import type { Product } from "../types/marketplace";
import { images } from "./images";

export const products: Product[] = [
{
  id: "p-palm",
  slug: "zomi-red-palm-oil",
  name: "Red Palm Oil",
  vendorId: "v-ada",
  categoryId: "cat-food",
  subcategory: "Palm & cooking oils",
  image: images.palmOil,
  description: "Unrefined red palm oil for stews, soups and jollof. Bottled in the UK by the seller.",
  variants: [
  { id: "p-palm-1l", label: "1 litre", pricePence: 699, stock: 48 },
  { id: "p-palm-2l", label: "2 litres", pricePence: 1249, stock: 12 }],

  ingredients: "100% palm oil.",
  allergens: [],
  storage: "Store in a cool, dry place away from direct sunlight.",
  handling: "ambient",
  moderation: "approved",
  rating: 4.8,
  reviewCount: 96
},
{
  id: "p-garri",
  slug: "ijebu-garri-white",
  name: "Ijebu Garri (White)",
  vendorId: "v-ada",
  categoryId: "cat-food",
  subcategory: "Garri",
  image: images.garri,
  description: "Crisp, sour-style white garri. Great for drinking or making eba.",
  variants: [
  { id: "p-garri-1kg", label: "1.5 kg", pricePence: 549, stock: 64 },
  { id: "p-garri-4kg", label: "4 kg", pricePence: 1299, stock: 3 }],

  ingredients: "Cassava.",
  allergens: [],
  storage: "Keep sealed in a cool, dry place.",
  handling: "ambient",
  moderation: "approved",
  rating: 4.9,
  reviewCount: 143
},
{
  id: "p-egusi",
  slug: "ground-egusi",
  name: "Ground Egusi",
  vendorId: "v-steel",
  categoryId: "cat-food",
  subcategory: "Cooking ingredients",
  image: images.egusi,
  description: "Finely ground melon seeds for egusi soup. Packed in Sheffield.",
  variants: [
  { id: "p-egusi-500", label: "500 g", pricePence: 799, stock: 30 },
  { id: "p-egusi-1kg", label: "1 kg", pricePence: 1450, stock: 18 }],

  ingredients: "Melon seeds (Citrullus lanatus).",
  allergens: ["Packed in a facility that also handles peanuts"],
  storage: "Refrigerate after opening and use within 4 weeks.",
  handling: "ambient",
  moderation: "approved",
  rating: 4.7,
  reviewCount: 58,
  isNew: true
},
{
  id: "p-chips",
  slug: "plantain-chips-lightly-salted",
  name: "Plantain Chips — Lightly Salted",
  vendorId: "v-steel",
  categoryId: "cat-food",
  subcategory: "Snacks",
  image: images.plantainChips,
  description: "Thin-cut ripe plantain chips, fried in sunflower oil.",
  variants: [
  { id: "p-chips-single", label: "85 g bag", pricePence: 199, stock: 120 },
  { id: "p-chips-box", label: "Box of 12", pricePence: 1999, stock: 22 }],

  compareAtPence: 239,
  ingredients: "Plantain, sunflower oil, salt.",
  allergens: [],
  storage: "Store in a cool, dry place.",
  handling: "ambient",
  moderation: "approved",
  rating: 4.6,
  reviewCount: 211,
  isNew: true
},
{
  id: "p-garri-yellow",
  slug: "yellow-garri",
  name: "Yellow Garri",
  vendorId: "v-steel",
  categoryId: "cat-food",
  subcategory: "Garri",
  image: images.garri,
  description: "Smooth yellow garri processed with palm oil.",
  variants: [{ id: "p-gy-1kg", label: "1.5 kg", pricePence: 599, stock: 40 }],
  ingredients: "Cassava, palm oil.",
  allergens: [],
  storage: "Keep sealed in a cool, dry place.",
  handling: "ambient",
  moderation: "approved",
  rating: 4.5,
  reviewCount: 37
},
{
  id: "p-palm-large",
  slug: "palm-oil-family-size",
  name: "Palm Oil — Family Size",
  vendorId: "v-steel",
  categoryId: "cat-food",
  subcategory: "Palm & cooking oils",
  image: images.palmOil,
  description: "Larger bottle for households who cook often.",
  variants: [{ id: "p-pl-4l", label: "4 litres", pricePence: 2299, stock: 9 }],
  ingredients: "100% palm oil.",
  allergens: [],
  storage: "Store in a cool, dry place away from direct sunlight.",
  handling: "ambient",
  moderation: "pending",
  rating: 0,
  reviewCount: 0
}];