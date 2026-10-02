/**
 * URL Normalization and Validation Utilities
 *
 * Ensures consistent path storage, avoids duplicate path variations,
 * handles safe URI decoding, handles domain stripping for same-domain URLs,
 * and prevents path traversal attacks.
 */

// Known same-domain hosts / local development hosts
const KNOWN_LOCAL_OR_COLLEGE_HOSTS = [
  "localhost",
  "127.0.0.1",
  "fragnelcollege.edu.in",
  "www.fragnelcollege.edu.in",
];

/**
 * Checks whether a URL belongs to the college domain or localhost.
 *
 * @param {string} urlStr
 * @returns {boolean}
 */
export const isSameDomainOrLocal = (urlStr) => {
  if (typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return true; // Relative path is always same-domain
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    return (
      KNOWN_LOCAL_OR_COLLEGE_HOSTS.includes(hostname) ||
      hostname.endsWith(".fragnelcollege.edu.in") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
};

/**
 * Normalizes a URL path for Link Management (Redirects and Legacy File Mappings).
 *
 * Examples:
 *   "https://www.fragnelcollege.edu.in/toplinks/iqac/" -> "/toplinks/iqac"
 *   "http://localhost:5173/academics/courses" -> "/academics/courses"
 *   "//academics/cs///" -> "/academics/cs"
 *   "https://old.college.edu/wp-content/uploads/2023/11/AQAR.pdf?v=1" -> "/wp-content/uploads/2023/11/AQAR.pdf"
 *   "/about-us?x=1#section" -> "/about-us"
 *   "/wp-content/uploads/2023/11/AQAR%202023.pdf" -> "/wp-content/uploads/2023/11/AQAR 2023.pdf"
 *
 * @param {string} rawPath
 * @returns {string} Normalized path
 */
export const normalizePath = (rawPath) => {
  if (typeof rawPath !== "string") {
    throw new Error("Path must be a string");
  }

  let cleaned = rawPath.trim();

  if (!cleaned) {
    throw new Error("Path cannot be empty");
  }

  // If full absolute URL passed, extract pathname
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsedUrl = new URL(cleaned);
      cleaned = parsedUrl.pathname;
    } catch {
      // Fallback: strip scheme and host
      cleaned = cleaned.replace(/^https?:\/\/[^/]+/i, "");
    }
  }

  // Strip query string and hash fragment
  cleaned = cleaned.split("?")[0].split("#")[0];

  // Replace backslashes with forward slashes
  cleaned = cleaned.replace(/\\/g, "/");

  // Prevent path traversal
  if (cleaned.includes("..")) {
    throw new Error("Path traversal (..) is not allowed");
  }

  // Safe URI decoding (handles %20, %2F etc.)
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // If malformed URI, proceed with raw cleaned string
  }

  // Collapse multiple consecutive slashes into one
  cleaned = cleaned.replace(/\/+/g, "/");

  // Ensure leading slash
  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`;
  }

  // Remove trailing slash if length > 1 (e.g. "/about/" -> "/about", but keep "/")
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
};

/**
 * Checks whether a destination string is a genuine external HTTP/HTTPS URL
 * (i.e. Not same-domain or localhost).
 *
 * @param {string} dest
 * @returns {boolean}
 */
export const isExternalUrl = (dest) => {
  if (typeof dest !== "string") return false;
  const trimmed = dest.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  return !isSameDomainOrLocal(trimmed);
};

/**
 * Validates a legacy or source path.
 * Supports full absolute URLs (e.g., https://www.fragnelcollege.edu.in/toplinks/iqac/)
 * and relative local paths (e.g., /toplinks/iqac/).
 *
 * @param {string} pathStr
 * @returns {{ valid: boolean, error?: string, normalized?: string }}
 */
export const validateSourcePath = (pathStr) => {
  if (!pathStr || typeof pathStr !== "string") {
    return { valid: false, error: "Source path is required." };
  }

  const trimmed = pathStr.trim();

  if (trimmed.includes("..")) {
    return { valid: false, error: "Path traversal (..) is not allowed." };
  }

  try {
    const normalized = normalizePath(trimmed);
    if (!normalized || normalized === "/") {
      return { valid: false, error: "Source path cannot be empty or root '/'." };
    }
    return { valid: true, normalized };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

/**
 * Validates destination (can be a relative path, same-domain URL, or external URL).
 *
 * If it's a same-domain or localhost URL (e.g. http://localhost:5173/about-us/history or
 * https://www.fragnelcollege.edu.in/about-us/history), normalizes it to relative path.
 *
 * If it's a genuine external URL (e.g. https://www.ugc.gov.in/), preserves the full URL.
 *
 * @param {string} destination
 * @param {object} [options]
 * @param {boolean} [options.isExplicitExternal=false]
 * @returns {{ valid: boolean, error?: string, normalized?: string, isExternal?: boolean }}
 */
export const validateDestination = (destination, { isExplicitExternal = false } = {}) => {
  if (!destination || typeof destination !== "string") {
    return { valid: false, error: "Destination is required." };
  }

  const trimmed = destination.trim();

  // If it's an external URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { valid: false, error: "External URL must use http or https." };
      }

      // Check if it's actually a same-domain or localhost URL
      if (!isExplicitExternal && isSameDomainOrLocal(trimmed)) {
        const normalized = normalizePath(url.pathname + (url.search || "") + (url.hash || ""));
        return { valid: true, normalized, isExternal: false };
      }

      return { valid: true, normalized: trimmed, isExternal: true };
    } catch {
      return { valid: false, error: "Invalid URL format." };
    }
  }

  if (trimmed.includes("..")) {
    return { valid: false, error: "Path traversal (..) is not allowed in destination." };
  }

  try {
    const normalized = normalizePath(trimmed);
    return { valid: true, normalized, isExternal: false };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

