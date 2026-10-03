import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

/* GLOBAL */
import Header from "./Components/Header";
import Navbar from "./Components/NavBar";
import Footer from "./Components/Footer";

/* HOME */
import HomePageTemplate from "./Components/HomePageTemplate";

/* DYNAMIC */
import DynamicPage from "./Pages/DynamicPage";

/* COURSES */
import CoursesDirectory from "./Components/Courses/CoursesDirectory";

/* REUSABLE LAYOUT */
import SectionLayout from "./Layouts/SectionLayout";
import SectionRedirect from "./Layouts/SectionRedirect";

/* ADMIN */
import AdminRoutes from "./admin/routes/AdminRoutes";

/* LEGACY RESOLVER / 404 */
import LegacyResolverFallback from "./Components/LegacyResolverFallback";
import { initGoogleAnalytics, trackPageView } from "./utils/googleAnalytics";
import { clearPageCache } from "./utils/pageCache";
import { clearSidebarCache } from "./utils/sidebarCache";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // If navigating with an explicit anchor or department scroll query, do not force scroll to top
    if (location.hash || location.search.includes("dept=")) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash, location.search]);

  return null;
}

const DEFAULT_HEADER = {
  title: "Fr. Agnel College of Arts & Commerce",
  subtitle: "Affiliated to Goa University",
  tagline: "Accredited by NAAC with Grade A+ (CGPA 3.28)",
};

function App() {

  const [header, setHeader] =
    useState(DEFAULT_HEADER);

  const [footer, setFooter] =
    useState(null);

  const location = useLocation();

  // Initialize GA and track pageviews safely
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // FIXED: startsWith("/admin") was also matching
  // "/administration" since "/admin" is a text
  // prefix of it. Now we check for "/admin" as its
  // own path segment instead of a loose substring.
  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  useEffect(() => {
    let initialVersion = null;

    const loadSettings = () => {
      fetch("/api/settings/header", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setHeader(data);
          }
        })
        .catch(() => console.log("Header error"));

      fetch("/api/settings/footer", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data) setFooter(data);
        })
        .catch(() => console.log("Footer error"));
    };

    const checkVersionAndRevalidate = () => {
      // 1. Invalidate in-memory caches to guarantee freshness
      clearPageCache();
      clearSidebarCache();

      // 2. Revalidate settings and broadcast revalidate event to active pages/components
      loadSettings();
      window.dispatchEvent(new CustomEvent("app:revalidate"));

      // 3. Check if server deployed a new version of the frontend
      fetch("/api/version", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.version) {
            if (!initialVersion) {
              initialVersion = data.version;
            } else if (initialVersion !== data.version) {
              // A new build was deployed: seamlessly refresh the page
              window.location.reload();
            }
          }
        })
        .catch(() => {});
    };

    checkVersionAndRevalidate();

    // Revalidate when page is restored from mobile browser background / bfcache / tab resume
    const handlePageShow = (e) => {
      if (e.persisted) {
        window.location.reload();
      } else {
        checkVersionAndRevalidate();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersionAndRevalidate();
      }
    };

    const handleFocus = () => {
      checkVersionAndRevalidate();
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <>
      <ScrollToTop />

      {!isAdminRoute && (
        <>
          <Header data={header} />
          <Navbar />
        </>
      )}

      <Routes>

        {/* ADMIN */}
        {AdminRoutes}

        {/* HOME */}
        <Route
          path="/"
          element={<HomePageTemplate />}
        />

        {/* COURSES DIRECTORY */}
        <Route
          path="/courses"
          element={<CoursesDirectory />}
        />

        {/* DIRECT COURSE DETAIL */}
        <Route
          path="/courses/:slug"
          element={<DynamicPage />}
        />

        {/* GENERIC PAGE */}
        <Route
          path="/page/:slug"
          element={<DynamicPage />}
        />

        {/* NOTICES REDIRECTS & ALIASES */}
        <Route
          path="/notices/circulars"
          element={<Navigate to="/examination/exam-notices" replace />}
        />
        <Route
          path="/notices/admissions"
          element={<Navigate to="/admissions/admission-notices" replace />}
        />
        <Route
          path="/notices/vacancies"
          element={<Navigate to="/campus-alumni/general-announcements" replace />}
        />
        <Route
          path="/examination/notices"
          element={<Navigate to="/examination/exam-notices" replace />}
        />
        <Route
          path="/admissions/notices"
          element={<Navigate to="/admissions/admission-notices" replace />}
        />
        <Route
          path="/administration/notices"
          element={<Navigate to="/campus-alumni/general-announcements" replace />}
        />

        {/* DYNAMIC SECTION ROUTE */}
        <Route
          path=":parentSlug"
          element={<SectionLayout />}
        >
          <Route
            index
            element={<SectionRedirect />}
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />
        </Route>

        {/* 404 & LEGACY LINK RESOLVER */}
        <Route
          path="*"
          element={<LegacyResolverFallback />}
        />

      </Routes>

      {!isAdminRoute && (
        <Footer data={footer} />
      )}

    </>
  );
}

export default App;