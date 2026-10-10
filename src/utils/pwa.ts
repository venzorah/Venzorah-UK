import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, setMeta } from "./seo";

const ICON_URL = "/VENZORAL_ICON_LOGO.png";


function upsertLink(rel: string, href: string, extra: Record<string, string> = {}) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(extra).forEach(([k, v]) => el?.setAttribute(k, v));
}

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Registers favicon, Apple touch icon, theme colour and web app manifest using the VenZorah icon logo. */
export function installPwaMetadata() {
  setMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION);
  upsertLink("icon", ICON_URL, { type: "image/png" });
  upsertLink("apple-touch-icon", ICON_URL);
  upsertMeta("theme-color", "#06245F");
  upsertMeta("apple-mobile-web-app-title", "VenZorah");
  upsertMeta("apple-mobile-web-app-capable", "yes");

  const manifest = {
    name: "VenZorah — Shop Products and Services",
    short_name: "VenZorah",
    start_url: window.location.origin + "/",
    scope: window.location.origin + "/",
    display: "standalone",
    background_color: "#F5F7FB",
    theme_color: "#06245F",
    icons: [
    { src: ICON_URL, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: ICON_URL, sizes: "512x512", type: "image/png", purpose: "any maskable" }]

  };
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  upsertLink("manifest", URL.createObjectURL(blob));
}

export { ICON_URL };