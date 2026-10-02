/**
 * Google Analytics (GA4) Tracker Utility
 *
 * Automatically and conditionally initializes gtag.js when a GA4 Measurement ID
 * is provided (via environment variables or backend settings).
 *
 * Tracks page views seamlessly on React Router route changes.
 */

let isInitialized = false;
let currentMeasurementId = null;

export const initGoogleAnalytics = async () => {
  if (isInitialized) return;

  try {
    // 1. Check environment variable first
    let measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

    // 2. If not in env, check public config endpoint from backend
    if (!measurementId) {
      const res = await fetch("/api/dashboard/analytics/public-config").catch(() => null);
      if (res && res.ok) {
        const config = await res.json().catch(() => null);
        if (config?.isConfigured && config?.measurementId) {
          measurementId = config.measurementId;
        }
      }
    }

    if (!measurementId || !measurementId.startsWith("G-")) {
      return;
    }

    currentMeasurementId = measurementId;

    // 3. Inject Google Tag script into document head
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // 4. Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: false, // We handle page views manually on route changes
    });

    isInitialized = true;
  } catch (err) {
    // Fail silently so the website never breaks
    console.debug("GA initialization bypassed:", err);
  }
};

/**
 * Track page view on client route change
 */
export const trackPageView = (path) => {
  // Do not track admin CMS interactions
  if (!path || path.startsWith("/admin")) return;

  if (window.gtag && currentMeasurementId) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
      send_to: currentMeasurementId,
    });
  }
};
