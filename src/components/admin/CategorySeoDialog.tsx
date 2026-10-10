import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { usePlatform } from "../../contexts/PlatformContext";
import type { Category } from "../../types/marketplace";

const TITLE_MAX = 60;
const DESC_MAX = 160;

export function CategorySeoDialog({ category, onClose }: {category: Category | null;onClose: () => void;}) {
  const { updateCategorySeo } = usePlatform();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setTitle(category.seoTitle ?? `${category.name} | VenZorah`);
      setDescription(category.seoDescription ?? category.description);
    }
  }, [category]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    if (title.trim().length < 10) return toast.error("Meta title should be at least 10 characters");
    if (description.trim().length < 50) return toast.error("Meta description should be at least 50 characters");
    updateCategorySeo(category.id, title.trim(), description.trim());
    toast.success(`SEO saved for ${category.name}`);
    onClose();
  };

  const counter = (len: number, max: number) => <span className={`text-xs ${len > max ? "text-danger font-semibold" : "text-muted"}`}>{len}/{max}</span>;

  return (
    <AnimatePresence>
      {category &&
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
          <motion.form
          onSubmit={save}
          role="dialog"
          aria-modal="true"
          aria-labelledby="seo-title"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-pop">
          
            <h2 id="seo-title" className="text-lg font-extrabold text-navy">Search settings · {category.name}</h2>
            <p className="mt-1 text-sm text-muted">Used for the browser tab, Google results and link previews of /c/{category.slug}.</p>

            <label className="mt-5 block">
              <span className="flex justify-between"><span className="text-sm font-semibold text-ink">Meta title</span>{counter(title.length, TITLE_MAX)}</span>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-line px-3 text-sm" />
            </label>
            <label className="mt-4 block">
              <span className="flex justify-between"><span className="text-sm font-semibold text-ink">Meta description</span>{counter(description.length, DESC_MAX)}</span>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
            </label>

            <div className="mt-5 rounded-xl border border-line p-4" aria-label="Search result preview">
              <p className="text-xs text-muted">venzorah.co.uk › c › {category.slug}</p>
              <p className="mt-0.5 text-[#1a0dab] text-lg leading-snug truncate">{title || "Meta title"}</p>
              <p className="mt-0.5 text-sm text-ink/80 line-clamp-2">{description || "Meta description"}</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold">Cancel</button>
              <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Save</button>
            </div>
          </motion.form>
        </motion.div>
      }
    </AnimatePresence>);

}