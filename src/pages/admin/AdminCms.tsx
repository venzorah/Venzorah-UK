import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCms } from "../../contexts/CmsContext";
import { useAuth } from "../../contexts/AuthContext";
import { CmsBody } from "../../components/CmsBody";
import type { HomepageContent } from "../../types/marketplace";

export function AdminCms() {
  const { pages, homepage, updatePage, updateHomepage } = useCms();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>("homepage");
  const page = pages.find((p) => p.slug === selected);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [home, setHome] = useState<HomepageContent>(homepage);

  useEffect(() => {
    if (page) setDraft({ title: page.title, body: page.body });
  }, [page]);

  const savePage = () => {
    if (!page) return;
    if (draft.title.trim().length < 2 || draft.body.trim().length < 20) return toast.error("Add a title and some content");
    updatePage(page.slug, { title: draft.title.trim(), body: draft.body.trim() }, user?.name ?? "Admin");
    toast.success(`${draft.title} published`);
  };

  const saveHome = () => {
    if (!home.foodTitle.trim() || !home.servicesTitle.trim()) return toast.error("Both box titles are required");
    updateHomepage({ ...home, servicesTags: home.servicesTags.map((t) => t.trim()).filter(Boolean) });
    toast.success("Homepage updated");
  };

  const homeField = (k: Exclude<keyof HomepageContent, "servicesTags">, label: string, area = false) =>
  <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {area ?
    <textarea rows={2} value={home[k]} onChange={(e) => setHome({ ...home, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" /> :

    <input value={home[k]} onChange={(e) => setHome({ ...home, [k]: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" />
    }
    </label>;


  return (
    <div className="p-4 lg:p-8 max-w-7xl">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-navy">Content</h1>
      <p className="mt-1 text-muted">Edit the homepage boxes and policy pages. Changes publish to the marketplace immediately. Have legal pages reviewed by qualified advisers.</p>
      <div className="mt-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <nav aria-label="Content items" className="self-start bg-white rounded-2xl border border-line p-2">
          <button onClick={() => setSelected("homepage")} className={`w-full text-left px-3 h-9 rounded-lg text-sm ${selected === "homepage" ? "bg-navy text-white font-semibold" : "hover:bg-surface"}`}>Homepage boxes</button>
          <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted">Pages</p>
          {pages.map((p) =>
          <button key={p.slug} onClick={() => setSelected(p.slug)} className={`w-full text-left px-3 h-9 rounded-lg text-sm truncate ${selected === p.slug ? "bg-navy text-white font-semibold" : "hover:bg-surface"}`}>{p.title}</button>
          )}
        </nav>

        {selected === "homepage" ?
        <section className="bg-white rounded-2xl border border-line p-5 lg:p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="font-bold text-navy">Groceries box</h2>
              {homeField("foodTitle", "Title")}
              {homeField("foodText", "Description", true)}
              {homeField("foodCta", "Button label")}
            </div>
            <div className="space-y-3">
              <h2 className="font-bold text-navy">Services box</h2>
              {homeField("servicesTitle", "Title")}
              <label className="block">
                <span className="text-xs font-semibold text-muted">Service types (comma separated)</span>
                <input value={home.servicesTags.join(", ")} onChange={(e) => setHome({ ...home, servicesTags: e.target.value.split(",") })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" />
              </label>
              {homeField("servicesArea", "Area")}
              {homeField("servicesCta", "Button label")}
            </div>
            <div className="md:col-span-2 flex justify-end"><button onClick={saveHome} className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Publish homepage</button></div>
          </section> :
        page ?
        <section className="grid xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-line p-5 lg:p-6 space-y-3">
              <label className="block"><span className="text-xs font-semibold text-muted">Title</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
              <label className="block">
                <span className="text-xs font-semibold text-muted">Content — blank line between paragraphs, “## ” for headings</span>
                <textarea rows={16} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm font-mono" />
              </label>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">Last published {format(new Date(page.updatedAt), "d MMM yyyy, HH:mm")} by {page.updatedBy}</p>
                <button onClick={savePage} className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Publish</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-line p-5 lg:p-6">
              <p className="text-xs font-semibold text-muted mb-3">Preview</p>
              <h2 className="text-2xl font-extrabold text-navy mb-4">{draft.title}</h2>
              <CmsBody body={draft.body} />
            </div>
          </section> :
        null}
      </div>
    </div>);

}