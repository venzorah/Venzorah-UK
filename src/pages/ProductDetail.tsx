import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckIcon, MinusIcon, PlusIcon, StarIcon, TruckIcon } from "lucide-react";
import { toast } from "sonner";
import { usePublicCatalog } from "../hooks/useCatalog";
import { usePlatform } from "../contexts/PlatformContext";
import { useCart } from "../contexts/CartContext";
import { formatPence } from "../utils/money";
import { quoteVendorShipping } from "../utils/shipping";
import { ProductCard } from "../components/store/ProductCard";
import { ContactProvider } from "../components/store/ContactProvider";
import { SaveButton } from "../components/store/SaveButton";
import { usePageMeta } from "../hooks/usePageMeta";

export function ProductDetail() {
  const { slug } = useParams();
  const { products } = usePublicCatalog();
  const { vendors } = usePlatform();
  const { add, postcode } = useCart();
  const product = products.find((p) => p.slug === slug);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  usePageMeta(product ? `${product.name} | Buy Online UK | VenZorah` : undefined, product ? product.description.slice(0, 155) : undefined);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Product not available</h1>
        <p className="mt-2 text-muted">It may be out of stock, under review or removed by the seller.</p>
        <Link to="/browse" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">Keep browsing</Link>
      </div>);

  }

  const vendor = vendors.find((v) => v.id === product.vendorId)!;
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const options = quoteVendorShipping(vendor, variant.pricePence * qty, postcode);
  const related = products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-10">
      <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
        <Link to="/c/african-foods" className="hover:text-navy">African Foods Hub</Link> / <span>{product.subcategory}</span>
      </nav>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-line">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <Link to={`/browse?vendor=${vendor.slug}`} className="text-sm font-semibold text-navy hover:underline">{vendor.name}</Link>
          <h1 className="mt-1 text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">{product.name}</h1>
          {product.reviewCount > 0 &&
          <p className="mt-2 flex items-center gap-1 text-sm text-muted"><StarIcon className="h-4 w-4 fill-gold text-gold" />{product.rating} · {product.reviewCount} verified reviews</p>
          }
          <p className="mt-5 text-3xl font-extrabold text-navy">{formatPence(variant.pricePence)}</p>
          <p className="mt-4 text-ink/80 leading-relaxed">{product.description}</p>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-ink">Size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((v) =>
              <button key={v.id} onClick={() => {setVariantId(v.id);setQty(1);}} disabled={v.stock === 0} aria-pressed={v.id === variant.id} className={`h-11 px-4 rounded-xl border text-sm font-semibold transition-colors duration-150 ${v.id === variant.id ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy/40"} disabled:opacity-40`}>
                  {v.label}
                </button>
              )}
            </div>
            <p className={`mt-2 text-sm ${variant.stock <= 5 ? "text-danger font-semibold" : "text-success"}`}>
              {variant.stock === 0 ? "Out of stock" : variant.stock <= 5 ? `Only ${variant.stock} left` : "In stock"}
            </p>
          </fieldset>

          <div className="mt-5 flex gap-3">
            <div className="flex items-center h-12 rounded-xl border border-line bg-white">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-11 flex items-center justify-center" aria-label="Decrease quantity"><MinusIcon className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(variant.stock, q + 1))} className="h-12 w-11 flex items-center justify-center" aria-label="Increase quantity"><PlusIcon className="h-4 w-4" /></button>
            </div>
            <button
              disabled={variant.stock === 0}
              onClick={() => {
                add({ productId: product.id, variantId: variant.id, qty }, variant.stock);
                toast.success("Added to basket");
              }}
              className="flex-1 h-12 rounded-xl bg-gold text-navy font-bold transition-transform duration-150 ease-out active:scale-[0.98] disabled:bg-line disabled:text-muted">
              
              Add to basket
            </button>
            <SaveButton id={product.id} name={product.name} className="self-center" />
          </div>

          <section className="mt-8 rounded-2xl bg-white border border-line p-5" aria-labelledby="delivery">
            <h2 id="delivery" className="flex items-center gap-2 font-bold text-navy"><TruckIcon className="h-5 w-5" />Delivery to {postcode}</h2>
            <p className="text-xs text-muted mt-1">Shipped by {vendor.name}. Prices and windows are set by the seller.</p>
            <ul className="mt-4 space-y-3">
              {options.map((o) =>
              <li key={o.method.id} className={`flex items-start justify-between gap-3 ${o.eligible ? "" : "opacity-50"}`}>
                  <div>
                    <p className="text-sm font-semibold text-ink">{o.method.name}{o.method.type === "express" && <span className="ml-2 px-1.5 py-0.5 rounded bg-gold-50 text-navy text-[11px] font-bold">Express</span>}</p>
                    <p className="text-xs text-muted">{o.eligible ? `${o.estimate} · ${o.dispatchBy}` : o.reason}</p>
                  </div>
                  <p className="text-sm font-bold text-navy whitespace-nowrap">{o.pricePence === 0 ? "Free" : formatPence(o.pricePence)}</p>
                </li>
              )}
            </ul>
            {vendor.shipping.freeThresholdPence &&
            <p className="mt-4 text-xs text-muted">Free standard delivery on {vendor.name} orders over {formatPence(vendor.shipping.freeThresholdPence)}.</p>
            }
          </section>

          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {product.ingredients && <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-semibold text-ink">Ingredients</dt><dd className="col-span-2 text-ink/80">{product.ingredients}</dd></div>}
            <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-semibold text-ink">Allergens</dt><dd className="col-span-2 text-ink/80">{product.allergens && product.allergens.length ? product.allergens.join(", ") : "Seller declares no allergens. Check the label on delivery."}</dd></div>
            {product.storage && <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-semibold text-ink">Storage</dt><dd className="col-span-2 text-ink/80">{product.storage}</dd></div>}
            <div className="py-3 grid grid-cols-3 gap-4"><dt className="font-semibold text-ink">Returns</dt><dd className="col-span-2 text-ink/80">Unopened ambient groceries can be returned within 14 days. Your statutory rights are unaffected.</dd></div>
          </dl>

          <div className="mt-6 flex items-center gap-2 text-sm text-success"><CheckIcon className="h-4 w-4" />Registered food business, verified by VenZorah</div>
          <div className="mt-4"><ContactProvider vendor={vendor} subject={product.name} /></div>
        </div>
      </div>

      {related.length > 0 &&
      <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-extrabold text-navy">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      }
    </div>);

}