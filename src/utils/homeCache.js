const STORAGE_KEY = "college_home_cache_v5";

let clientHomeCache = null;

export const getClientHomeCache = () => {
  if (clientHomeCache) return clientHomeCache;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        clientHomeCache = JSON.parse(stored);
        return clientHomeCache;
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    } catch {
      // Ignore storage errors
    }
  }
};
