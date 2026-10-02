import express from "express";

import {
  getHome,
  updateHome,
} from "../controllers/home.controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { filterHomeSections } from "../middleware/scopeMiddleware.js";

const router = express.Router();

// Public — website needs to read Home data
router.get("/", getHome);

// Protected — authenticated CMS users + section-level scope check
router.put(
  "/",
  requireAuth,
  requirePermission("pages.edit"),
  filterHomeSections,
  updateHome
);

export default router;