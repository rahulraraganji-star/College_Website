import { useEffect, useState } from "react";
import { Navigate, useParams, useOutletContext } from "react-router-dom";
import LoadingScreen from "../Components/LoadingScreen";
import { sidebarCache } from "./SectionLayout";

const SectionRedirect = () => {
  const { parentSlug } = useParams();
  const outletContext = useOutletContext();
  const contextNavItems = outletContext?.navItems;

  const getCachedFirstPage = () => {
    if (Array.isArray(contextNavItems) && contextNavItems.length > 0) {
      const first = contextNavItems[0];
      const slug = first.to ? first.to.split("/").filter(Boolean).pop() : first.slug;
      return slug ? { slug } : null;
    }
    const cached = sidebarCache.get(parentSlug);
    if (Array.isArray(cached) && cached.length > 0) {
      const first = cached[0];
      const slug = first.to ? first.to.split("/").filter(Boolean).pop() : first.slug;
      return slug ? { slug } : null;
    }
    return null;
  };

  const [firstPage, setFirstPage] = useState(getCachedFirstPage);
  const [loading, setLoading] = useState(() => !getCachedFirstPage());

  useEffect(() => {
    const cached = getCachedFirstPage();
    if (cached) {
      setFirstPage(cached);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    fetch(
      `/api/pages/sidebar/${parentSlug}`
    )
      .then((res) => res.json())
      .then((pages) => {
        if (!isCurrent) return;
        if (Array.isArray(pages) && pages.length > 0) {
          setFirstPage(pages[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error(err);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [parentSlug, contextNavItems]);

  if (loading) {
    return <LoadingScreen fullScreen={false} text="Loading section..." />;
  }

  if (!firstPage) {
    return (
      <div className="p-20 text-center">
        No pages found.
      </div>
    );
  }

  return (
    <Navigate
      to={`/${parentSlug}/${firstPage.slug}`}
      replace
    />
  );
};

export default SectionRedirect;