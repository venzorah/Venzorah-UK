import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../../contexts/CartContext";
import { usePlatform } from "../../contexts/PlatformContext";
import { formatPence } from "../../utils/money";
import { SaveButton } from "./SaveButton";
import type { Product } from "../../types/marketplace";

export function ProductCard({ product }: {product: Product;}) {
  const { vendors } = usePlatform();
  const { add } = useCart();
  const vendor = vendors.find((v) => v.id === product.vendorId);
  const variant = product.variants[0];
  const outOfStock = product.variants.every((v) => v.stock === 0);

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-line">
      <Link to={`/p/${product.slug}`} className="block aspect-square bg-surface overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
      </Link>
      {product.isNew && <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-navy text-white text-[11px] font-bold">New</span>}
      <SaveButton id={product.id} name={product.name} className="absolute top-2.5 right-2.5" />
      <div className="flex flex-col flex-1 p-3">
        <p className="text-xs text-muted truncate">{vendor?.name}</p>
        <Link to={`/p/${product.slug}`} className="mt-0.5 text-sm font-semibold text-ink leading-snug line-clamp-2 min-h-[2.5rem] hover:text-navy">
          {product.name}
        </Link>
        {product.reviewCount > 0 &&
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {product.rating.toFixed(1)} ({product.reviewCount})
          </p>
        }
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <p className="text-base font-bold text-navy">{formatPence(variant.pricePence)}</p>
            <p className="text-[11px] text-muted">{variant.label}</p>
          </div>
          <button
            disabled={outOfStock}
            onClick={() => {
              add({ productId: product.id, variantId: variant.id, qty: 1 }, variant.stock);
              toast.success(`${product.name} added to basket`);
            }}
            aria-label={`Add ${product.name} to basket`}
            className="h-9 w-9 rounded-full bg-gold text-navy flex items-center justify-center transition-transform duration-150 ease-out active:scale-95 disabled:bg-line disabled:text-muted">
            
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>);

}