/**
 * Helper to ensure internal upload images are never stuck in stale browser disk cache.
 * Appending a consistent cache-buster query parameter forces mobile & desktop browsers
 * to fetch the latest rotated and optimized image file directly from the server.
 */
export const getCleanImageUrl = (url) => {
  if (!url || typeof url !== "string") return url || "";
  if (url.startsWith("/uploads/") || url.includes("/uploads/media/images/")) {
    if (url.includes("v=")) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=4`;
  }
  return url;
};
