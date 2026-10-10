import React from "react";
import { Link } from "react-router-dom";
import { usePublicCatalog } from "../../hooks/useCatalog";

export function StoreFooter() {
  const { categories } = usePublicCatalog();
  return (
    <footer className="bg-navy text-white mt-16 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-xl font-extrabold">
            Ven<span className="text-gold">Zorah</span>
          </p>
          <p className="mt-2 text-sm text-white/70">Shop African groceries online in the UK with VenZorah. Discover trusted food stores, beauty and hair services, massage, spas and wellness providers in one marketplace.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {categories.map((c) =>
            <li key={c.id}>
                <Link to={`/c/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gold">For businesses</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link to="/sell" className="hover:text-white">Become a vendor</Link></li>
            <li><Link to="/vendor" className="hover:text-white">Vendor dashboard</Link></li>
            <li><Link to="/admin" className="hover:text-white">Admin portal</Link></li>
          </ul>
          <h2 className="mt-6 text-sm font-bold text-gold">Help</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link to="/support" className="hover:text-white">Support</Link></li>
            <li><Link to="/help/faqs" className="hover:text-white">FAQs</Link></li>
            <li><Link to="/help/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gold">Policies</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link to="/help/about" className="hover:text-white">About</Link></li>
            <li><Link to="/help/terms" className="hover:text-white">Terms and conditions</Link></li>
            <li><Link to="/help/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link to="/help/shipping-returns" className="hover:text-white">Shipping, returns & refunds</Link></li>
            <li><Link to="/help/cancellations" className="hover:text-white">Booking cancellations</Link></li>
            <li><Link to="/help/account-deletion" className="hover:text-white">Account deletion</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 lg:px-6 py-4 text-xs text-white/60">© 2026 VenZorah. Prices in GBP. Demo environment: payments are not processed.</p>
      </div>
    </footer>);

}