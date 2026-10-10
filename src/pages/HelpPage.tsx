import React from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Link, NavLink, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useCms } from "../contexts/CmsContext";
import { CmsBody } from "../components/CmsBody";

export function HelpPage() {
  const { slug } = useParams();
  const { pages } = useCms();
  const page = pages.find((p) => p.slug === (slug ?? "faqs"));

  usePageMeta(page ? `${page.title} | VenZorah` : undefined, page ? page.body.replace(/##\s/g, "").replace(/\s+/g, " ").slice(0, 155) : undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 lg:py-10 grid lg:grid-cols-[240px_1fr] gap-8">
      <nav aria-label="Help and policies" className="lg:sticky lg:top-36 self-start">
        <p className="text-xs font-semibold text-muted">Help & policies</p>
        <ul className="mt-2 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {pages.map((p) =>
          <li key={p.slug} className="shrink-0">
              <NavLink to={`/help/${p.slug}`} className={({ isActive }) => `block px-3 h-9 leading-9 rounded-lg text-sm whitespace-nowrap ${isActive || !slug && p.slug === "faqs" ? "bg-navy text-white font-semibold" : "text-ink hover:bg-white"}`}>
                {p.title}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <article className="bg-white rounded-2xl border border-line p-6 lg:p-10">
        {page ?
        <>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">{page.title}</h1>
            <p className="mt-1 text-xs text-muted">Last updated {format(new Date(page.updatedAt), "d MMMM yyyy")}</p>
            <div className="mt-6 max-w-2xl"><CmsBody body={page.body} /></div>
            <p className="mt-10 text-sm text-muted">Still need help? <Link to="/support" className="underline text-navy">Contact support</Link></p>
          </> :

        <p className="text-muted">Page not found.</p>
        }
      </article>
    </div>);

}