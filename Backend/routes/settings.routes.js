import express from "express";

import {
  getHeader,
  getFooter,
  getAllSettings,
  updateHeader,
  updateFooter,
} from "../controllers/settings.controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ==========================================
   PUBLIC SETTINGS
========================================== */

// Prevent browsers/proxies from caching dynamic settings
router.use((req, res, next) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

router.get(
  "/",
  getAllSettings
);

router.get(
  "/header",
  getHeader
);

router.get(
  "/footer",
  getFooter
);

/* ==========================================
   ADMIN / PROTECTED SETTINGS
========================================== */

router.put(
  "/header",
  requireAuth,
  requirePermission("settings.edit"),
  updateHeader
);

router.put(
  "/footer",
  requireAuth,
  requirePermission("settings.edit"),
  updateFooter
);

export default router;