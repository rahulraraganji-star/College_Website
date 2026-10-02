// Global client-side sidebar cache
export const sidebarCache = new Map();

/**
 * Prefetches sidebar nav items into memory
 * @param {string} parentSlug
 */
export const prefetchSidebar = (parentSlug) => {
  if (!parentSlug || sidebarCache.has(parentSlug)) return;

  fetch(`/api/pages/sidebar/${parentSlug}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (Array.isArray(data)) {
        const items = data.map((page) => ({
          to: `/${parentSlug}/${page.slug}`,
          label: page.title,
        }));
        sidebarCache.set(parentSlug, items);
      }
    })
    .catch(() => {});
};
