import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SearchXIcon } from "lucide-react";
import { useSearch, usePublicCatalog, type CatalogFilters } from "../hooks/useCatalog";
import { usePlatform } from "../contexts/PlatformContext";
import { ProductCard } from "../components/store/ProductCard";
import { ServiceCard } from "../components/store/ServiceCard";
import { CardGridSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";

export function Browse() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { categories } = usePublicCatalog();
  const { categories: allCategories, vendors } = usePlatform();
  const filters: CatalogFilters = {
    q: params.get("q") ?? undefined,
    categorySlug: slug ?? params.get("category") ?? undefined,
    vendorSlug: params.get("vendor") ?? undefined,
    sort: params.get("sort") as CatalogFilters["sort"] ?? "relevance"
  };
  const view = params.get("view");
  const { data, isLoading, isError, refetch } = useSearch(filters);
  const requested = allCategories.find((c) => c.slug === filters.categorySlug);
  const vendor = vendors.find((v) => v.slug === filters.vendorSlug);
  usePageMeta(
    requested?.status === "published" ?
    requested.seoTitle || `${requested.name} | VenZorah` :
    vendor ?
    `${vendor.name} | VenZorah` :
    view === "products" ?
    "Shop Products Online UK | VenZorah Marketplace" :
    view === "services" ?
    "Find Local Services in the UK | VenZorah" :
    undefined,
    requested?.status === "published" ?
    requested.seoDescription || requested.description :
    view === "products" ?
    "Shop African groceries and products online from verified UK sellers. Garri, egusi, palm oil, spices and snacks delivered across the UK." :
    view === "services" ?
    "Find and book trusted local salons, barbers, spas and massage therapists in Birmingham and Sheffield. Verified providers, live availability." :
    undefined
  );

  if (requested && requested.status !== "published") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-navy">This category isn't available</h1>
        <p className="mt-2 text-muted">It may have been paused. Your existing orders and bookings are unaffected.</p>
        <Link to="/" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">Back to home</Link>
      </div>);

  }

  const title = vendor?.name ?? requested?.name ?? (filters.q ? `Results for “${filters.q}”` : view === "services" ? "Local services" : view === "products" ? "Products" : "Browse everything");
  const showProducts = view !== "services";
  const showServices = view !== "products";
  const products = showProducts ? data?.products ?? [] : [];
  const services = showServices ? data?.services ?? [] : [];
  const modeSwitch = !requested && !vendor;
  const empty = !isLoading && products.length === 0 && services.length === 0;

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);else
    next.delete(k);
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8">
      {modeSwitch &&
      <div role="tablist" aria-label="Show" className="mb-5 inline-flex rounded-xl bg-white border border-line p-1">
          {([
        ["products", "Products"],
        ["services", "Services"]] as
        const).map(([id, label]) => {
          const active = view === id;
          return (
            <button key={id} role="tab" aria-selected={active} onClick={() => setParam("view", id)} className={`h-10 px-5 rounded-lg text-sm font-semibold transition-colors duration-150 ${active ? "bg-navy text-white" : "text-ink hover:bg-surface"}`}>
                {label}
              </button>);

        })}
        </div>
      }
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">{title}</h1>
          {requested && <p className="mt-1 text-muted max-w-2xl">{requested.description}</p>}
          {vendor && <p className="mt-1 text-muted">{vendor.city} · Verified vendor</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted whitespace-nowrap">Sort by</span>
          <select value={filters.sort} onChange={(e) => setParam("sort", e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-medium">
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>

      {requested && requested.subcategories.length > 0 &&
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {requested.subcategories.map((s) =>
        <button key={s} onClick={() => setParam("q", filters.q === s ? null : s)} className={`shrink-0 h-9 px-3 rounded-full border text-sm whitespace-nowrap transition-colors duration-150 ${filters.q === s ? "bg-navy text-white border-navy" : "bg-white border-line text-ink hover:border-navy/40"}`}>
              {s}
            </button>
        )}
        </div>
      }

      {!requested && !vendor &&
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.filter((c) => view === "products" ? c.kind === "product" : view === "services" ? c.kind !== "product" : true).map((c) =>
        <Link key={c.id} to={`/c/${c.slug}`} className="shrink-0 h-9 px-3 inline-flex items-center rounded-full border border-line bg-white text-sm whitespace-nowrap hover:border-navy/40">{c.name}</Link>
        )}
        </div>
      }

      <div className="mt-6">
        {isLoading && <CardGridSkeleton />}
        {isError &&
        <div className="py-16 text-center">
            <p className="font-semibold text-navy">We couldn't load results.</p>
            <button onClick={() => refetch()} className="mt-3 h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Try again</button>
          </div>
        }
        {empty &&
        <div className="py-20 text-center">
            <SearchXIcon className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold text-navy">Nothing matches yet</p>
            <p className="text-sm text-muted">Try a different search or browse a category.</p>
          </div>
        }
        {products.length > 0 &&
        <section aria-label="Products">
            {services.length > 0 && <h2 className="text-lg font-bold text-navy mb-3">Products</h2>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        }
        {services.length > 0 &&
        <section aria-label="Services" className={products.length > 0 ? "mt-10" : ""}>
            {products.length > 0 && <h2 className="text-lg font-bold text-navy mb-3">Services</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          </section>
        }
      </div>
    </div>);

}