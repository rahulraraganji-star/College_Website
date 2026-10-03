import { useEffect, useState, useRef } from "react";
import {
  useParams,
  useOutletContext,
} from "react-router-dom";

import PageTemplate from "../Components/PageTemplate";
import CoursesTemplate from "../Components/Courses/CoursesTemplate";
import CoursesDirectory from "../Components/Courses/CoursesDirectory";
import LoadingScreen from "../Components/LoadingScreen";
import {
  clientPageCache,
  clientPageTimestamps,
  inFlightPagePromises,
  FRESH_TTL_MS,
} from "../utils/pageCache";

const DynamicPage = () => {
  const { slug } = useParams();

  // Get navItems from SectionLayout
  const outletContext = useOutletContext();
  const navItems = outletContext?.navItems ?? [];

  const [prevSlug, setPrevSlug] = useState(slug);
  const [page, setPage] = useState(() => clientPageCache.get(slug) || null);
  const [error, setError] = useState(null);
  const pageRef = useRef(null);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setPage(clientPageCache.get(slug) || null);
    setError(null);
  }

  useEffect(() => {
    if (!slug) return;

    // Scroll to top upon page navigation unless targeting an anchor or department
    if (!window.location.hash && !window.location.search.includes("dept=")) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    const now = Date.now();
    const isCached = clientPageCache.has(slug);
    const isFresh = isCached && (now - (clientPageTimestamps.get(slug) || 0) < FRESH_TTL_MS);

    if (isFresh) {
      return;
    }

    // Background fetch / stale-while-revalidate / reuse in-flight prefetch
    let isCurrent = true;

    const fetchPromise = inFlightPagePromises.has(slug)
      ? inFlightPagePromises.get(slug)
      : fetch(`/api/pages/${slug}`, { cache: "no-store" }).then((res) => {
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

  // Revalidate current page when tab resumes or version changes
  useEffect(() => {
    const handleRevalidate = () => {
      if (!slug) return;
      clientPageCache.delete(slug);
      clientPageTimestamps.delete(slug);
      fetch(`/api/pages/${slug}`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("Page not found");
          return res.json();
        })
        .then((data) => {
          if (data) {
            clientPageCache.set(slug, data);
            clientPageTimestamps.set(slug, Date.now());
            setPage(data);
            setError(null);
          }
        })
        .catch(() => {});
    };

    window.addEventListener("app:revalidate", handleRevalidate);
    return () => {
      window.removeEventListener("app:revalidate", handleRevalidate);
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