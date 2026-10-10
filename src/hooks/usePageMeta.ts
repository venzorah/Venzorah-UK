import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, setMeta } from "../utils/seo";

/** Applies page-specific meta while mounted and restores the site defaults on leave. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    setMeta(title || DEFAULT_TITLE, description || DEFAULT_DESCRIPTION);
    return () => setMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION);
  }, [title, description]);
}