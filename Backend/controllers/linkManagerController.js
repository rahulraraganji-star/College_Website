import fs from "fs";
import path from "path";
import Redirect from "../models/Redirect.js";
import FileMapping from "../models/FileMapping.js";
import Media from "../models/Media.js";
import {
  resolveLegacyPath,
  checkCrossConflict,
} from "../services/linkResolver.js";
import {
  normalizePath,
  validateSourcePath,
  validateDestination,
} from "../utils/urlNormalizer.js";
import { createAuditLog } from "../services/auditService.js";

/* ==========================================================
   REDIRECT CONTROLLERS
========================================================== */

/**
 * Get all redirects with search, filters, and pagination
 */
export const getRedirects = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { q, status, statusCode } = req.query;

    const query = {};

    // Search query
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { sourcePath: searchRegex },
        { destination: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter
    if (status === "active") {
      query.active = true;
    } else if (status === "inactive") {
      query.active = false;
    }

    // Status Code filter
    if (statusCode && [301, 302].includes(Number(statusCode))) {
      query.statusCode = Number(statusCode);
    }

    const [redirects, total] = await Promise.all([
      Redirect.find(query)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Redirect.countDocuments(query),
    ]);

    return res.json({
      success: true,
      redirects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET REDIRECTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch redirects.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get single redirect by ID
 */
export const getRedirectById = async (req, res) => {
  try {
    const redirect = await Redirect.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: "Redirect not found.",
      });
    }

    return res.json({
      success: true,
      redirect,
    });
  } catch (error) {
    console.error("GET REDIRECT BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch redirect.",
    });
  }
};

/**
 * Create a new redirect
 */
export const createRedirect = async (req, res) => {
  try {
    const { sourcePath, destination, statusCode = 301, active = true, description = "" } = req.body;

    // Validate source path
    const sourceValidation = validateSourcePath(sourcePath);
    if (!sourceValidation.valid) {
      return res.status(400).json({
        success: false,
        message: sourceValidation.error,
      });
    }

    // Validate destination
    const destValidation = validateDestination(destination);
    if (!destValidation.valid) {
      return res.status(400).json({
        success: false,
        message: destValidation.error,
      });
    }

    const normalizedSource = sourceValidation.normalized;
    const normalizedDest = destValidation.normalized;

    // Check if source and destination are identical
    if (normalizedSource.toLowerCase() === normalizedDest.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Source URL and Destination URL cannot be identical (would cause a redirect loop).",
      });
    }

    // Validate status code
    const parsedStatusCode = Number(statusCode);
    if (![301, 302].includes(parsedStatusCode)) {
      return res.status(400).json({
        success: false,
        message: "Status code must be 301 (Permanent) or 302 (Temporary).",
      });
    }

    // Check cross conflicts & duplicates & loops
    const conflictCheck = await checkCrossConflict({
      path: normalizedSource,
      destination: normalizedDest,
      targetType: "redirect",
    });

    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictCheck.error,
      });
    }

    const redirect = await Redirect.create({
      sourcePath: normalizedSource,
      destination: normalizedDest,
      statusCode: parsedStatusCode,
      active: Boolean(active),
      description: description ? description.trim() : "",
      createdBy: req.authUser?._id || null,
      updatedBy: req.authUser?._id || null,
    });

    // Create Audit Log
    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "Redirect",
        resourceId: redirect._id,
        resourceName: redirect.sourcePath,
        action: "CREATE_REDIRECT",
        after: redirect.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.status(201).json({
      success: true,
      message: "Redirect created successfully.",
      redirect,
    });
  } catch (error) {
    console.error("CREATE REDIRECT ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A redirect with this source path already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create redirect.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update an existing redirect
 */
export const updateRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.findById(id);

    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: "Redirect not found.",
      });
    }

    const beforeState = redirect.toObject();

    const { sourcePath, destination, statusCode, active, description } = req.body;

    let normalizedSource = redirect.sourcePath;
    let normalizedDest = redirect.destination;

    if (sourcePath !== undefined) {
      const sourceValidation = validateSourcePath(sourcePath);
      if (!sourceValidation.valid) {
        return res.status(400).json({
          success: false,
          message: sourceValidation.error,
        });
      }
      normalizedSource = sourceValidation.normalized;
    }

    if (destination !== undefined) {
      const destValidation = validateDestination(destination);
      if (!destValidation.valid) {
        return res.status(400).json({
          success: false,
          message: destValidation.error,
        });
      }
      normalizedDest = destValidation.normalized;
    }

    if (normalizedSource.toLowerCase() === normalizedDest.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Source URL and Destination URL cannot be identical.",
      });
    }

    if (statusCode !== undefined) {
      const code = Number(statusCode);
      if (![301, 302].includes(code)) {
        return res.status(400).json({
          success: false,
          message: "Status code must be 301 or 302.",
        });
      }
      redirect.statusCode = code;
    }

    // Check conflict & loop if sourcePath or destination changed
    if (normalizedSource !== redirect.sourcePath || normalizedDest !== redirect.destination) {
      const conflictCheck = await checkCrossConflict({
        path: normalizedSource,
        destination: normalizedDest,
        excludeId: redirect._id,
        targetType: "redirect",
      });

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflictCheck.error,
        });
      }
      redirect.sourcePath = normalizedSource;
    }

    redirect.destination = normalizedDest;
    if (active !== undefined) redirect.active = Boolean(active);
    if (description !== undefined) redirect.description = description.trim();
    redirect.updatedBy = req.authUser?._id || null;

    await redirect.save();

    const populated = await Redirect.findById(redirect._id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "Redirect",
        resourceId: redirect._id,
        resourceName: redirect.sourcePath,
        action: "UPDATE_REDIRECT",
        before: beforeState,
        after: redirect.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: "Redirect updated successfully.",
      redirect: populated,
    });
  } catch (error) {
    console.error("UPDATE REDIRECT ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A redirect with this source path already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update redirect.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Toggle active status of a redirect
 */
export const toggleRedirectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.findById(id);

    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: "Redirect not found.",
      });
    }

    const beforeState = redirect.toObject();
    redirect.active = !redirect.active;
    redirect.updatedBy = req.authUser?._id || null;
    await redirect.save();

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "Redirect",
        resourceId: redirect._id,
        resourceName: redirect.sourcePath,
        action: redirect.active ? "ENABLE_REDIRECT" : "DISABLE_REDIRECT",
        before: beforeState,
        after: redirect.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: `Redirect ${redirect.active ? "activated" : "deactivated"} successfully.`,
      redirect,
    });
  } catch (error) {
    console.error("TOGGLE REDIRECT STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle redirect status.",
    });
  }
};

/**
 * Delete a redirect
 */
export const deleteRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.findById(id);

    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: "Redirect not found.",
      });
    }

    const beforeState = redirect.toObject();
    await redirect.deleteOne();

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "Redirect",
        resourceId: redirect._id,
        resourceName: redirect.sourcePath,
        action: "DELETE_REDIRECT",
        before: beforeState,
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: "Redirect deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE REDIRECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete redirect.",
    });
  }
};

/* ==========================================================
   FILE MAPPING CONTROLLERS
========================================================== */

/**
 * Get all legacy file mappings with search, filters, and pagination
 */
export const getFileMappings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { q, status } = req.query;

    const query = {};

    // Search query
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");

      // Also search in matching media items by originalName or filename
      const matchingMedia = await Media.find({
        $or: [{ originalName: searchRegex }, { filename: searchRegex }],
      }).select("_id").lean();

      const mediaIds = matchingMedia.map((m) => m._id);

      query.$or = [
        { legacyPath: searchRegex },
        { description: searchRegex },
        { documentId: { $in: mediaIds } },
      ];
    }

    // Status filter
    if (status === "active") {
      query.active = true;
    } else if (status === "inactive") {
      query.active = false;
    }

    const [fileMappings, total] = await Promise.all([
      FileMapping.find(query)
        .populate("documentId", "filename originalName url size mimeType type")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FileMapping.countDocuments(query),
    ]);

    return res.json({
      success: true,
      fileMappings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET FILE MAPPINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch file mappings.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get single file mapping by ID
 */
export const getFileMappingById = async (req, res) => {
  try {
    const fileMapping = await FileMapping.findById(req.params.id)
      .populate("documentId", "filename originalName url size mimeType type")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!fileMapping) {
      return res.status(404).json({
        success: false,
        message: "File mapping not found.",
      });
    }

    return res.json({
      success: true,
      fileMapping,
    });
  } catch (error) {
    console.error("GET FILE MAPPING BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch file mapping.",
    });
  }
};

/**
 * Create a new legacy file mapping
 */
export const createFileMapping = async (req, res) => {
  try {
    const { legacyPath, documentId, active = true, description = "" } = req.body;

    // Validate legacy path
    const pathValidation = validateSourcePath(legacyPath);
    if (!pathValidation.valid) {
      return res.status(400).json({
        success: false,
        message: pathValidation.error,
      });
    }

    // Validate document reference
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Please select an existing document from the Media Library.",
      });
    }

    const media = await Media.findById(documentId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Selected document does not exist in the Media Library.",
      });
    }

    const normalizedLegacy = pathValidation.normalized;

    // Check cross conflicts & duplicates
    const conflictCheck = await checkCrossConflict({
      path: normalizedLegacy,
      targetType: "file_mapping",
    });

    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictCheck.error,
      });
    }

    const fileMapping = await FileMapping.create({
      legacyPath: normalizedLegacy,
      documentId: media._id,
      active: Boolean(active),
      description: description ? description.trim() : "",
      createdBy: req.authUser?._id || null,
      updatedBy: req.authUser?._id || null,
    });

    const populated = await FileMapping.findById(fileMapping._id)
      .populate("documentId", "filename originalName url size mimeType type")
      .populate("createdBy", "name email");

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "FileMapping",
        resourceId: fileMapping._id,
        resourceName: fileMapping.legacyPath,
        action: "CREATE_FILE_MAPPING",
        after: fileMapping.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.status(201).json({
      success: true,
      message: "Legacy file mapping created successfully.",
      fileMapping: populated,
    });
  } catch (error) {
    console.error("CREATE FILE MAPPING ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A file mapping for this legacy path already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create file mapping.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update an existing legacy file mapping
 */
export const updateFileMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const fileMapping = await FileMapping.findById(id);

    if (!fileMapping) {
      return res.status(404).json({
        success: false,
        message: "File mapping not found.",
      });
    }

    const beforeState = fileMapping.toObject();
    const { legacyPath, documentId, active, description } = req.body;

    let normalizedLegacy = fileMapping.legacyPath;

    if (legacyPath !== undefined) {
      const pathValidation = validateSourcePath(legacyPath);
      if (!pathValidation.valid) {
        return res.status(400).json({
          success: false,
          message: pathValidation.error,
        });
      }
      normalizedLegacy = pathValidation.normalized;
    }

    if (documentId !== undefined) {
      const media = await Media.findById(documentId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "Selected document does not exist in the Media Library.",
        });
      }
      fileMapping.documentId = media._id;
    }

    // Check conflict if path changed
    if (normalizedLegacy !== fileMapping.legacyPath) {
      const conflictCheck = await checkCrossConflict({
        path: normalizedLegacy,
        excludeId: fileMapping._id,
        targetType: "file_mapping",
      });

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflictCheck.error,
        });
      }
      fileMapping.legacyPath = normalizedLegacy;
    }

    if (active !== undefined) fileMapping.active = Boolean(active);
    if (description !== undefined) fileMapping.description = description.trim();
    fileMapping.updatedBy = req.authUser?._id || null;

    await fileMapping.save();

    const populated = await FileMapping.findById(fileMapping._id)
      .populate("documentId", "filename originalName url size mimeType type")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "FileMapping",
        resourceId: fileMapping._id,
        resourceName: fileMapping.legacyPath,
        action: "UPDATE_FILE_MAPPING",
        before: beforeState,
        after: fileMapping.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: "File mapping updated successfully.",
      fileMapping: populated,
    });
  } catch (error) {
    console.error("UPDATE FILE MAPPING ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A file mapping for this legacy path already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update file mapping.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Toggle active status of a file mapping
 */
export const toggleFileMappingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const fileMapping = await FileMapping.findById(id);

    if (!fileMapping) {
      return res.status(404).json({
        success: false,
        message: "File mapping not found.",
      });
    }

    const beforeState = fileMapping.toObject();
    fileMapping.active = !fileMapping.active;
    fileMapping.updatedBy = req.authUser?._id || null;
    await fileMapping.save();

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "FileMapping",
        resourceId: fileMapping._id,
        resourceName: fileMapping.legacyPath,
        action: fileMapping.active ? "ENABLE_FILE_MAPPING" : "DISABLE_FILE_MAPPING",
        before: beforeState,
        after: fileMapping.toObject(),
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: `File mapping ${fileMapping.active ? "activated" : "deactivated"} successfully.`,
      fileMapping,
    });
  } catch (error) {
    console.error("TOGGLE FILE MAPPING STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle file mapping status.",
    });
  }
};

/**
 * Delete a file mapping (Does NOT delete the actual document)
 */
export const deleteFileMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const fileMapping = await FileMapping.findById(id);

    if (!fileMapping) {
      return res.status(404).json({
        success: false,
        message: "File mapping not found.",
      });
    }

    const beforeState = fileMapping.toObject();

    // Delete mapping ONLY — physical Media document remains completely intact
    await fileMapping.deleteOne();

    if (req.authUser) {
      await createAuditLog({
        req,
        actor: req.authUser,
        resourceType: "FileMapping",
        resourceId: fileMapping._id,
        resourceName: fileMapping.legacyPath,
        action: "DELETE_FILE_MAPPING",
        before: beforeState,
      }).catch((err) => console.error("Audit log error:", err));
    }

    return res.json({
      success: true,
      message: "File mapping deleted successfully. (The actual document was preserved)",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE FILE MAPPING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file mapping.",
    });
  }
};

/* ==========================================================
   RESOLVER & TESTING CONTROLLERS
========================================================== */

/**
 * Test Link Resolver (Used by Admin UI "Test" button or modal)
 */
export const testResolver = async (req, res) => {
  try {
    const testPath = req.body.path || req.query.path;

    if (!testPath) {
      return res.status(400).json({
        success: false,
        message: "Path parameter is required for testing.",
      });
    }

    const resolution = await resolveLegacyPath(testPath, { trackHit: false });

    return res.json({
      success: true,
      inputPath: testPath,
      resolution,
    });
  } catch (error) {
    console.error("TEST RESOLVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Resolution test failed.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Public resolver endpoint (Used by frontend fallback router)
 */
export const resolvePublicLink = async (req, res) => {
  try {
    const rawPath = req.query.path || req.body.path;

    if (!rawPath) {
      return res.status(400).json({
        success: false,
        message: "Path is required.",
      });
    }

    const resolution = await resolveLegacyPath(rawPath, { trackHit: true });

    return res.json({
      success: true,
      resolution,
    });
  } catch (error) {
    console.error("PUBLIC RESOLVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resolve link.",
    });
  }
};

/**
 * Express Middleware / Route Handler for direct legacy requests (e.g. /wp-content/*)
 */
export const handleLegacyRequest = async (req, res, next) => {
  try {
    // Only handle GET and HEAD requests for legacy redirection/file serving
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const resolution = await resolveLegacyPath(req.path, { trackHit: true });

    if (resolution.found && resolution.valid) {
      if (resolution.type === "file") {
        // Stream / send file directly if it exists on disk
        if (resolution.physicalFilePath && fs.existsSync(resolution.physicalFilePath)) {
          return res.sendFile(resolution.physicalFilePath);
        }
        // Otherwise redirect to media URL
        return res.redirect(302, resolution.fileUrl);
      }

      if (resolution.type === "redirect") {
        return res.redirect(resolution.statusCode || 301, resolution.destination);
      }
    }

    // Not resolved through Link Manager -> pass to next middleware
    return next();
  } catch (error) {
    console.error("HANDLE LEGACY REQUEST ERROR:", error);
    return next();
  }
};

/**
 * Dedicated endpoint for testing and routing legacy resolutions directly:
 * GET /legacy-resolve/* or GET /legacy-resolve?path=...
 */
export const legacyResolveEndpoint = async (req, res, next) => {
  try {
    let rawPath = req.query.path || req.path || "";
    if (!rawPath || rawPath === "/") {
      if (req.query.path) {
        rawPath = req.query.path;
      } else if (req.originalUrl) {
        const parsed = req.originalUrl.split("?")[0];
        rawPath = parsed.replace(/^\/legacy-resolve\/?/i, "");
      }
    }
    if (!rawPath.startsWith("/")) {
      rawPath = `/${rawPath}`;
    }

    const resolution = await resolveLegacyPath(rawPath, { trackHit: true });

    if (resolution.found && resolution.valid) {
      if (resolution.type === "file") {
        if (resolution.physicalFilePath && fs.existsSync(resolution.physicalFilePath)) {
          return res.sendFile(resolution.physicalFilePath);
        }
        return res.redirect(302, resolution.fileUrl);
      }

      if (resolution.type === "redirect") {
        return res.redirect(resolution.statusCode || 301, resolution.destination);
      }
    }

    if (req.query.json === "true") {
      return res.status(404).json({
        success: false,
        message: "No active mapping found for this path.",
        resolution,
      });
    }

    return res.status(404).send(`Legacy URL "${rawPath}" was not found in the Link Manager.`);
  } catch (error) {
    console.error("LEGACY RESOLVE ENDPOINT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Legacy URL resolution failed.",
    });
  }
};
