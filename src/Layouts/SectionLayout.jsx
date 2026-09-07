import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

const SectionLayout = () => {
  const { parentSlug } = useParams();
  const [navItems, setNavItems] = useState(() => sidebarCache.get(parentSlug) || []);
  const [loading, setLoading] = useState(() => !sidebarCache.has(parentSlug));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentSlug) {
      setNavItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (sidebarCache.has(parentSlug)) {
      setNavItems(sidebarCache.get(parentSlug));
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError(null);

    let isCurrent = true;

    fetch(`/api/pages/sidebar/${parentSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sidebar data");
        return res.json();
      })
      .then((data) => {
        if (!isCurrent) return;
        const items = Array.isArray(data)
          ? data.map((page) => ({
              to: `/${parentSlug}/${page.slug}`,
              label: page.title,
            }))
          : [];
        sidebarCache.set(parentSlug, items);
        setNavItems(items);
        setError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (!sidebarCache.has(parentSlug)) {
          console.error(err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [parentSlug]);

  return (
    <Outlet
      context={{
        navItems,
        parentSlug,
        loading,
        error,
      }}
    />
  );
};

export default SectionLayout;