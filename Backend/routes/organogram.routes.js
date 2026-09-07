import express from "express";
import {
  getPublicOrganogram,
  getAdminOrganogram,
  getOrganogramNodeById,
  createOrganogramNode,
  updateOrganogramNode,
  deleteOrganogramNode,
  reorderOrganogramNodes,
} from "../controllers/organogram.controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ==========================================
   PUBLIC READ ENDPOINTS
========================================== */

router.get("/", getPublicOrganogram);

/* ==========================================
   PROTECTED CMS ENDPOINTS
========================================== */

router.get(
  "/admin/tree",
  requireAuth,
  requirePermission("organogram.view"),
  getAdminOrganogram
);

router.get(
  "/admin/:id",
  requireAuth,
  requirePermission("organogram.view"),
  getOrganogramNodeById
);

router.post(
  "/",
  requireAuth,
  requirePermission("organogram.create"),
  createOrganogramNode
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("organogram.edit"),
  updateOrganogramNode
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("organogram.delete"),
  deleteOrganogramNode
);

router.patch(
  "/reorder",
  requireAuth,
  requirePermission("organogram.edit"),
  reorderOrganogramNodes
);

export default router;
