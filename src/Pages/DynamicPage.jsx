import { useEffect, useState, useRef } from "react";
import {
  useParams,
  useOutletContext,
} from "react-router-dom";

import PageTemplate from "../components/PageTemplate";
import CoursesTemplate from "../Components/Courses/CoursesTemplate";
import CoursesDirectory from "../Components/Courses/CoursesDirectory";
import LoadingScreen from "../Components/LoadingScreen";

// Global client-side memory cache for instantaneous page switching
export const clientPageCache = new Map();
const clientPageTimestamps = new Map();
const inFlightPagePromises = new Map();
const FRESH_TTL_MS = 30000; // 30 seconds freshness window

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

const DynamicPage = () => {
  const { slug } = useParams();

  // Get navItems from SectionLayout
  const outletContext = useOutletContext();
  const navItems = outletContext?.navItems ?? [];

  const [page, setPage] = useState(() => clientPageCache.get(slug) || null);
  const [error, setError] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    // Scroll to top upon page navigation
    window.scrollTo({ top: 0, behavior: "instant" });

    const now = Date.now();
    const isCached = clientPageCache.has(slug);
    const isFresh = isCached && (now - (clientPageTimestamps.get(slug) || 0) < FRESH_TTL_MS);

    // If already in cache, switch content immediately (0ms delay)
    if (isCached) {
      setPage(clientPageCache.get(slug));
      setError(null);
      if (isFresh) {
        return;
      }
    } else {
      // Clear page only if not cached so old page content is not shown
      setPage(null);
    }

    // Background fetch / stale-while-revalidate / reuse in-flight prefetch
    let isCurrent = true;

    const fetchPromise = inFlightPagePromises.has(slug)
      ? inFlightPagePromises.get(slug)
      : fetch(`/api/pages/${slug}`).then((res) => {
          if (!res.ok) {
            throw new Error("Page not found");
          }
          return res.json();
        });

    fetchPromise
      .then((data) => {
        if (!isCurrent || !data) return;
        clientPageCache.set(slug, data);
        clientPageTimestamps.set(slug, Date.now());
        setPage(data);
        setError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (!clientPageCache.has(slug)) {
          console.error(err);
          setError("Page not found");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  if (!page && !error) {
    return <LoadingScreen fullScreen={false} text="Loading content..." />;
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          No content available
        </p>
      </div>
    );
  }

  if (page.template === "courses") {
    // If it is the courses directory page (has courseData.courses or slug is courses)
    if (page.courseData?.courses || page.slug === "courses") {
      return (
        <div key={page._id || page.slug || slug} className="page-transition" ref={pageRef}>
          <CoursesDirectory data={page} />
        </div>
      );
    }

    return (
      <div key={page._id || page.slug || slug} className="page-transition" ref={pageRef}>
        <CoursesTemplate
          data={page}
          navItems={navItems}
        />
      </div>
    );
  }

  return (
    <div key={page._id || page.slug || slug} className="page-transition" ref={pageRef}>
      <PageTemplate
        data={page}
        navItems={navItems}
      />
    </div>
  );
};

export default DynamicPage;