// Global client-side memory cache for instantaneous page switching
export const clientPageCache = new Map();
export const clientPageTimestamps = new Map();
export const inFlightPagePromises = new Map();
export const FRESH_TTL_MS = 30000; // 30 seconds freshness window

/**
 * Proactively prefetches a page into memory before the user clicks
 * @param {string} slug
 */
export const prefetchPage = (slug) => {
  if (!slug) return;
  const now = Date.now();
  if (clientPageCache.has(slug) && now - (clientPageTimestamps.get(slug) || 0) < FRESH_TTL_MS) {
    return;
  }
  if (inFlightPagePromises.has(slug)) return;

  const promise = fetch(`/api/pages/${slug}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        clientPageCache.set(slug, data);
        clientPageTimestamps.set(slug, Date.now());
      }
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inFlightPagePromises.delete(slug);
    });

  inFlightPagePromises.set(slug, promise);
};
