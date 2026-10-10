import { usePlatform } from "../contexts/PlatformContext";
import type { Product, Service } from "../types/marketplace";

export interface CatalogFilters {
  q?: string;
  categorySlug?: string;
  vendorSlug?: string;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating";
}

/** Public catalogue: only approved vendors, published categories and approved listings are ever returned. */
export function usePublicCatalog() {
  const { categories, vendors, products, services } = usePlatform();
  const published = new Set(categories.filter((c) => c.status === "published").map((c) => c.id));
  const approvedVendors = new Set(vendors.filter((v) => v.verification === "approved").map((v) => v.id));
  return {
    products: products.filter((p) => p.moderation === "approved" && published.has(p.categoryId) && approvedVendors.has(p.vendorId)),
    services: services.filter((s) => published.has(s.categoryId) && approvedVendors.has(s.vendorId)),
    categories: categories.filter((c) => c.status === "published")
  };
}

function matches(text: string, q?: string) {
  return !q || text.toLowerCase().includes(q.toLowerCase());
}

/**
 * Catalogue search. Runs synchronously against in-memory data so results render on the very first paint
 * after navigation — no async loading step that could leave a page stuck on a skeleton.
 */
export function useSearch(filters: CatalogFilters) {
  const { vendors, categories } = usePlatform();
  const catalog = usePublicCatalog();
  const data = (() => {
    const cat = categories.find((c) => c.slug === filters.categorySlug);
    const vendor = vendors.find((v) => v.slug === filters.vendorSlug);
    let products: Product[] = catalog.products.filter(
      (p) => (!cat || p.categoryId === cat.id) && (!vendor || p.vendorId === vendor.id) && matches(`${p.name} ${p.subcategory} ${p.description}`, filters.q)
    );
    let services: Service[] = catalog.services.filter(
      (s) => (!cat || s.categoryId === cat.id) && (!vendor || s.vendorId === vendor.id) && matches(`${s.name} ${s.description}`, filters.q)
    );
    const price = (p: Product) => p.variants[0].pricePence;
    if (filters.sort === "price_asc") {
      products = [...products].sort((a, b) => price(a) - price(b));
      services = [...services].sort((a, b) => a.pricePence - b.pricePence);
    } else if (filters.sort === "price_desc") {
      products = [...products].sort((a, b) => price(b) - price(a));
      services = [...services].sort((a, b) => b.pricePence - a.pricePence);
    } else if (filters.sort === "rating") {
      products = [...products].sort((a, b) => b.rating - a.rating);
      services = [...services].sort((a, b) => b.rating - a.rating);
    }
    return { products, services, category: cat && cat.status === "published" ? cat : undefined };
  })();
  return { data, isLoading: false, isError: false, refetch: () => undefined };
}