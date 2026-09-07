import express from "express";
import {
  getRedirects,
  getRedirectById,
  createRedirect,
  updateRedirect,
  toggleRedirectStatus,
  deleteRedirect,
  getFileMappings,
  getFileMappingById,
  createFileMapping,
  updateFileMapping,
  toggleFileMappingStatus,
  deleteFileMapping,
  testResolver,
  resolvePublicLink,
} from "../controllers/linkManagerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ==========================================
   PUBLIC RESOLUTION ROUTE
========================================== */

router.get("/resolve", resolvePublicLink);
router.post("/resolve", resolvePublicLink);

/* ==========================================
   TEST / DIAGNOSTIC ROUTE (PROTECTED)
========================================== */

router.get(
  "/test",
  requireAuth,
  requirePermission("link_manager.view"),
  testResolver
);

router.post(
  "/test",
  requireAuth,
  requirePermission("link_manager.view"),
  testResolver
);

/* ==========================================
   REDIRECTS CRUD (PROTECTED)
========================================== */

router.get(
  "/redirects",
  requireAuth,
  requirePermission("link_manager.view"),
  getRedirects
);

router.post(
  "/redirects",
  requireAuth,
  requirePermission("link_manager.create"),
  createRedirect
);

router.get(
  "/redirects/:id",
  requireAuth,
  requirePermission("link_manager.view"),
  getRedirectById
);

router.put(
  "/redirects/:id",
  requireAuth,
  requirePermission("link_manager.edit"),
  updateRedirect
);

router.patch(
  "/redirects/:id/status",
  requireAuth,
  requirePermission("link_manager.edit"),
  toggleRedirectStatus
);

router.delete(
  "/redirects/:id",
  requireAuth,
  requirePermission("link_manager.delete"),
  deleteRedirect
);

/* ==========================================
   LEGACY FILE MAPPINGS CRUD (PROTECTED)
========================================== */

router.get(
  "/file-mappings",
  requireAuth,
  requirePermission("link_manager.view"),
  getFileMappings
);

router.post(
  "/file-mappings",
  requireAuth,
  requirePermission("link_manager.create"),
  createFileMapping
);

router.get(
  "/file-mappings/:id",
  requireAuth,
  requirePermission("link_manager.view"),
  getFileMappingById
);

router.put(
  "/file-mappings/:id",
  requireAuth,
  requirePermission("link_manager.edit"),
  updateFileMapping
);

router.patch(
  "/file-mappings/:id/status",
  requireAuth,
  requirePermission("link_manager.edit"),
  toggleFileMappingStatus
);

router.delete(
  "/file-mappings/:id",
  requireAuth,
  requirePermission("link_manager.delete"),
  deleteFileMapping
);

export default router;
