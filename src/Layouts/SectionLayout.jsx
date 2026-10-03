import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { sidebarCache } from "../utils/sidebarCache";

const SectionLayout = () => {
  const { parentSlug } = useParams();
  const [prevSlug, setPrevSlug] = useState(parentSlug);
  const [navItems, setNavItems] = useState(() => sidebarCache.get(parentSlug) || []);
  const [loading, setLoading] = useState(() => !sidebarCache.has(parentSlug));
  const [error, setError] = useState(null);

  if (parentSlug !== prevSlug) {
    setPrevSlug(parentSlug);
    setNavItems(sidebarCache.get(parentSlug) || []);
    setLoading(!sidebarCache.has(parentSlug));
    setError(null);
  }

  useEffect(() => {
    if (!parentSlug) return;

    let isCurrent = true;

    const loadSidebarData = () => {
      fetch(`/api/pages/sidebar/${parentSlug}`, { cache: "no-store" })
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
    };

    loadSidebarData();

    const handleRevalidate = () => {
      sidebarCache.delete(parentSlug);
      loadSidebarData();
    };

    window.addEventListener("app:revalidate", handleRevalidate);

    return () => {
      isCurrent = false;
      window.removeEventListener("app:revalidate", handleRevalidate);
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