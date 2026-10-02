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
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-[#F8F5F0]">
      <div className="text-8xl font-['Fraunces'] font-bold text-[#E6DED3] mb-2">404</div>
      <h1 className="text-3xl sm:text-4xl font-['Fraunces'] font-medium text-[#2A2623] mb-3">Page Not Found</h1>
      <p className="font-['Inter'] text-[#7A7268] max-w-md mb-8 leading-relaxed">
        The institutional page or document you are looking for might have been updated, relocated, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#C9A555] text-white px-7 py-3 rounded-full font-['Inter'] font-semibold text-sm hover:bg-[#8A6B3F] transition-all shadow-sm"
      >
        <span>←</span>
        <span>Return to College Portal</span>
      </Link>
    </div>
  );
};

export default LegacyResolverFallback;
