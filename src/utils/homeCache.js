const STORAGE_KEY = "college_home_cache_v6";
const MAX_CACHE_AGE_MS = 60 * 1000; // 60 seconds freshness

let clientHomeCache = null;

export const getClientHomeCache = () => {
  if (clientHomeCache) return clientHomeCache;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < MAX_CACHE_AGE_MS) {
          clientHomeCache = parsed.data;
          return clientHomeCache;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return null;
};

export const setClientHomeCache = (data) => {
  clientHomeCache = data;
  if (typeof window !== "undefined" && data) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch {
      // Ignore storage write/quota errors
    }
  }
};

export const clearClientHomeCache = () => {
  clientHomeCache = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("college_home_cache_v5");
      localStorage.removeItem("college_home_cache_v2");
    } catch {
      // Ignore storage errors
    }
  }
};

