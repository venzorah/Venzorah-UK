import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "lucide-react";
import { useCustomer } from "../../contexts/CustomerContext";
import { usePublicCatalog } from "../../hooks/useCatalog";
import { ProductCard } from "../store/ProductCard";
import { ServiceCard } from "../store/ServiceCard";

export function WishlistTab() {
  const { wishlist } = useCustomer();
  const { products, services } = usePublicCatalog();
  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const savedServices = services.filter((s) => wishlist.includes(s.id));
  const unavailable = wishlist.length - savedProducts.length - savedServices.length;

  if (savedProducts.length + savedServices.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-line">
        <HeartIcon className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-2 font-semibold text-navy">Nothing saved yet</p>
        <p className="text-sm text-muted">Tap the heart on any product or service to save it here.</p>
        <Link to="/browse" className="mt-3 inline-block text-sm font-semibold text-navy underline">Browse</Link>
      </div>);

  }

  return (
    <div className="mt-6 space-y-8">
      {unavailable > 0 && <p className="text-sm text-muted">{unavailable} saved item{unavailable > 1 ? "s are" : " is"} currently unavailable and hidden.</p>}
      {savedProducts.length > 0 &&
      <section aria-label="Saved products">
          <h2 className="font-bold text-navy mb-3">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{savedProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      }
      {savedServices.length > 0 &&
      <section aria-label="Saved services">
          <h2 className="font-bold text-navy mb-3">Services</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">{savedServices.map((s) => <ServiceCard key={s.id} service={s} />)}</div>
        </section>
      }
    </div>);

}