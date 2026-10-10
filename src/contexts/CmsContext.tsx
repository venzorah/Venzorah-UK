import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { cmsPages, homepageContent } from "../data/cms";
import type { CmsPage, HomepageContent } from "../types/marketplace";

interface CmsState {
  pages: CmsPage[];
  homepage: HomepageContent;
  updatePage: (slug: string, patch: Pick<CmsPage, "title" | "body">, by: string) => void;
  updateHomepage: (content: HomepageContent) => void;
}

const CmsContext = createContext<CmsState | null>(null);

export function CmsProvider({ children }: {children: React.ReactNode;}) {
  const [pages, setPages] = usePersistentState<CmsPage[]>("vz-cms-pages-v3", cmsPages, "session");
  const [homepage, setHomepage] = usePersistentState<HomepageContent>("vz-cms-home-v3", homepageContent, "session");

  const value = useMemo<CmsState>(
    () => ({
      pages,
      homepage,
      updatePage: (slug, patch, by) => setPages((ps) => ps.map((p) => p.slug === slug ? { ...p, ...patch, updatedAt: new Date().toISOString(), updatedBy: by } : p)),
      updateHomepage: setHomepage
    }),
    [pages, homepage]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsState {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used inside CmsProvider");
  return ctx;
}