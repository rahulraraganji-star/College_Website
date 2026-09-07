import path from "path";
import Redirect from "../models/Redirect.js";
import FileMapping from "../models/FileMapping.js";
import { normalizePath } from "../utils/urlNormalizer.js";

/**
 * Resolves a legacy URL path according to priority:
 * 1. File Mapping (if active and valid document exists)
 * 2. Redirect (if active)
 * 3. Not Found (null / not_found object)
 *
 * @param {string} rawPath
 * @param {object} options
 * @param {boolean} options.trackHit - Whether to record hitCount & lastResolvedAt
 * @returns {Promise<object>} Resolution result
 */
export const resolveLegacyPath = async (rawPath, { trackHit = false } = {}) => {
  try {
    let normalizedPath;
    try {
      normalizedPath = normalizePath(rawPath);
    } catch {
      return {
        found: false,
        type: "not_found",
        error: "Malformed URL path",
        rawPath,
      };
    }

    /* ------------------------------------------
       1. CHECK ACTIVE FILE MAPPING
    ------------------------------------------ */
    const fileMapping = await FileMapping.findOne({
      legacyPath: normalizedPath,
      active: true,
    }).populate("documentId", "filename originalName url type mimeType size");

    if (fileMapping) {
      // Missing / deleted Media reference safeguard
      if (!fileMapping.documentId) {
        return {
          found: true,
          type: "file",
          valid: false,
          error: "Document reference missing or deleted in Media library",
          mapping: fileMapping,
          normalizedPath,
        };
      }

      // Track analytics asynchronously (fire-and-forget)
      if (trackHit) {
        FileMapping.updateOne(
          { _id: fileMapping._id },
          { $inc: { hitCount: 1 }, $set: { lastResolvedAt: new Date() } }
        ).catch((err) => console.error("Error updating FileMapping hitCount:", err));
      }

      const media = fileMapping.documentId;
      const physicalFilePath = path.join(
        process.cwd(),
        media.url.replace(/^\//, "")
      );

      return {
        found: true,
        type: "file",
        valid: true,
        normalizedPath,
        mapping: fileMapping,
        document: media,
        fileUrl: media.url,
        physicalFilePath,
        mimeType: media.mimeType,
        filename: media.filename,
        originalName: media.originalName,
      };
    }

    /* ------------------------------------------
       2. CHECK ACTIVE REDIRECT
    ------------------------------------------ */
    const redirect = await Redirect.findOne({
      sourcePath: normalizedPath,
      active: true,
    });

    if (redirect) {
      // Track analytics asynchronously (fire-and-forget)
      if (trackHit) {
        Redirect.updateOne(
          { _id: redirect._id },
          { $inc: { hitCount: 1 }, $set: { lastResolvedAt: new Date() } }
        ).catch((err) => console.error("Error updating Redirect hitCount:", err));
      }

      return {
        found: true,
        type: "redirect",
        valid: true,
        normalizedPath,
        redirect,
        statusCode: redirect.statusCode,
        destination: redirect.destination,
      };
    }

    /* ------------------------------------------
       3. CHECK INACTIVE MATCHES (DIAGNOSTICS)
    ------------------------------------------ */
    const inactiveFile = await FileMapping.findOne({
      legacyPath: normalizedPath,
      active: false,
    });

    if (inactiveFile) {
      return {
        found: false,
        type: "not_found",
        inactiveMatch: true,
        matchType: "file_mapping",
        mappingId: inactiveFile._id,
        normalizedPath,
        message: "A matching Legacy File Mapping exists, but is currently inactive.",
      };
    }

    const inactiveRedirect = await Redirect.findOne({
      sourcePath: normalizedPath,
      active: false,
    });

    if (inactiveRedirect) {
      return {
        found: false,
        type: "not_found",
        inactiveMatch: true,
        matchType: "redirect",
        redirectId: inactiveRedirect._id,
        normalizedPath,
        message: "A matching Redirect exists, but is currently inactive.",
      };
    }

    /* ------------------------------------------
       4. NOTHING FOUND
    ------------------------------------------ */
    return {
      found: false,
      type: "not_found",
      normalizedPath,
    };
  } catch (error) {
    console.error("RESOLVE LEGACY PATH ERROR:", error);
    throw error;
  }
};

/**
 * Detects redirect loops (self-loop or chain loops like A -> B -> A).
 *
 * @param {string} sourcePath - Normalized source path
 * @param {string} destination - Destination (relative or external)
 * @param {string} [excludeId] - ID being updated
 * @returns {Promise<{ hasLoop: boolean, error?: string }>}
 */
export const detectRedirectLoop = async (sourcePath, destination, excludeId = null) => {
  // 1. Direct self-redirect check
  if (sourcePath.toLowerCase() === destination.toLowerCase()) {
    return {
      hasLoop: true,
      error: `Redirect loop detected: "${sourcePath}" cannot redirect to itself.`,
    };
  }

  // If destination is external, no internal loop is possible
  if (/^https?:\/\//i.test(destination)) {
    return { hasLoop: false };
  }

  // 2. Multi-step chain loop detection (e.g. A -> B -> A)
  let currentTarget = destination;
  const visited = [sourcePath.toLowerCase()];
  const maxHops = 10;
  let hops = 0;

  while (currentTarget && !/^https?:\/\//i.test(currentTarget) && hops < maxHops) {
    hops++;
    const nextRedirect = await Redirect.findOne({
      sourcePath: currentTarget,
      active: true,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!nextRedirect) break;

    const nextTarget = nextRedirect.destination.toLowerCase();
    if (visited.includes(nextTarget)) {
      return {
        hasLoop: true,
        error: `Redirect loop detected: "${sourcePath}" -> "${destination}" forms a circular redirect loop.`,
      };
    }

    visited.push(nextTarget);
    currentTarget = nextRedirect.destination;
  }

  return { hasLoop: false };
};

/**
 * Validates cross-model uniqueness and prevents conflicts between Redirects and File Mappings.
 *
 * @param {object} params
 * @param {string} params.path - Normalized path
 * @param {string} [params.destination] - Destination path if validating redirect
 * @param {string} [params.excludeId] - ID to exclude when updating
 * @param {'redirect'|'file_mapping'} params.targetType - Model being created/updated
 * @returns {Promise<{ hasConflict: boolean, error?: string }>}
 */
export const checkCrossConflict = async ({
  path: normalizedPath,
  destination = null,
  excludeId = null,
  targetType,
}) => {
  if (targetType === "redirect") {
    // Check duplicate in Redirects
    const query = { sourcePath: normalizedPath };
    if (excludeId) query._id = { $ne: excludeId };

    const duplicateRedirect = await Redirect.findOne(query);
    if (duplicateRedirect) {
      return {
        hasConflict: true,
        error: `A Redirect for source path "${normalizedPath}" already exists.`,
      };
    }

    // Check conflict with File Mappings
    const conflictingFile = await FileMapping.findOne({ legacyPath: normalizedPath });
    if (conflictingFile) {
      return {
        hasConflict: true,
        error: `A Legacy File Mapping already exists for path "${normalizedPath}". A path cannot be both a File Mapping and a Redirect.`,
      };
    }

    // Check redirect loop if destination provided
    if (destination) {
      const loopCheck = await detectRedirectLoop(normalizedPath, destination, excludeId);
      if (loopCheck.hasLoop) {
        return {
          hasConflict: true,
          error: loopCheck.error,
        };
      }
    }
  } else if (targetType === "file_mapping") {
    // Check duplicate in File Mappings
    const query = { legacyPath: normalizedPath };
    if (excludeId) query._id = { $ne: excludeId };

    const duplicateFile = await FileMapping.findOne(query);
    if (duplicateFile) {
      return {
        hasConflict: true,
        error: `A Legacy File Mapping for path "${normalizedPath}" already exists.`,
      };
    }

    // Check conflict with Redirects
    const conflictingRedirect = await Redirect.findOne({ sourcePath: normalizedPath });
    if (conflictingRedirect) {
      return {
        hasConflict: true,
        error: `A Redirect already exists for source path "${normalizedPath}". A path cannot be both a File Mapping and a Redirect.`,
      };
    }
  }

  return { hasConflict: false };
};

