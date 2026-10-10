export const DEFAULT_TITLE = "VenZorah | Shop African Foods, Products & Services UK";
export const DEFAULT_DESCRIPTION =
"Shop African groceries online in the UK with VenZorah. Discover trusted food stores, beauty and hair services, massage, spas and wellness providers in one marketplace.";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Sets document title, meta description and matching Open Graph / Twitter tags. */
export function setMeta(title: string = DEFAULT_TITLE, description: string = DEFAULT_DESCRIPTION) {
  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "VenZorah");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
}