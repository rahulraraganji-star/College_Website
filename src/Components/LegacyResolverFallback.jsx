import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

const API_URL = "/api";

const LegacyResolverFallback = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [redirectingMessage, setRedirectingMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const currentPath = location.pathname + (location.search || "");

    const checkLegacyRoute = async () => {
      try {
        const res = await fetch(
          `${API_URL}/link-manager/resolve?path=${encodeURIComponent(currentPath)}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data?.success && data?.resolution?.found && data?.resolution?.valid) {
          const { resolution } = data;

          if (resolution.type === "redirect") {
            setRedirectingMessage(`Redirecting to ${resolution.destination}...`);
            if (/^https?:\/\//i.test(resolution.destination)) {
              window.location.replace(resolution.destination);
            } else {
              window.location.replace(resolution.destination);
            }
            return;
          }

          if (resolution.type === "file") {
            setRedirectingMessage(`Opening ${resolution.originalName || "document"}...`);
            window.location.replace(resolution.fileUrl);
            return;
          }
        }

        setChecking(false);
      } catch (err) {
        console.error("Legacy resolver check failed:", err);
        if (isMounted) setChecking(false);
      }
    };

    checkLegacyRoute();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, location.search]);

  if (checking || redirectingMessage) {
    return (
      <LoadingScreen
        fullScreen={false}
        text={redirectingMessage || "Looking up requested page..."}
      />
    );
  }

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl font-serif font-bold text-gray-200 mb-2">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page or file you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition shadow-sm"
      >
        <span>←</span>
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};

export default LegacyResolverFallback;
