/**
 * Turns every in-app page change into a real browser page load.
 *
 * Pages always render correctly when loaded directly, but on the live site switching pages in place
 * left a blank screen until the user refreshed. Routing every change through a normal page load
 * makes each click behave exactly like that working refresh. App data that must survive the load
 * (basket, orders, bookings, admin changes) is kept in session storage by the data providers.
 *
 * Hash-only changes and same-URL updates stay in place.
 */
export function installFullPageNavigation() {
  const { pushState, replaceState } = window.history;

  const resolve = (url?: string | URL | null) => {
    if (url === undefined || url === null) return null;
    try {
      const next = new URL(String(url), window.location.href);
      if (next.origin !== window.location.origin) return null;
      const changed = next.pathname !== window.location.pathname || next.search !== window.location.search;
      return changed ? next : null;
    } catch {
      return null;
    }
  };

  window.history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
    const next = resolve(url);
    if (next) {
      window.location.assign(next.href);
      return;
    }
    return pushState.call(window.history, data, unused, url);
  };

  window.history.replaceState = function (data: unknown, unused: string, url?: string | URL | null) {
    const next = resolve(url);
    if (next) {
      window.location.replace(next.href);
      return;
    }
    return replaceState.call(window.history, data, unused, url);
  };
}