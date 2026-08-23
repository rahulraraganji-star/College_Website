import express from "express";

import {
  getAllPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  getPagesByParent,
  togglePublishPage,
  deletePage,
} from "../controllers/pages.controller.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";

import {
  requirePageAccessFromPage,
  requirePageAccessFromBody,
} from "../middleware/scopeMiddleware.js";


const router = express.Router();


/* ==========================================
   PUBLIC READ OPERATIONS
========================================== */


/* Sidebar pages */

router.get(
  "/sidebar/:parentSlug",
  getPagesByParent
);


/* Public page by slug */

router.get(
  "/:slug",
  getPageBySlug
);


/* ==========================================
   CMS READ OPERATIONS
========================================== */


/* Get page by MongoDB ID */

router.get(
  "/id/:id",
  requireAuth,
  requirePermission("pages.view"),
  requirePageAccessFromPage,
  getPageById
);


/* Get all pages for CMS */

router.get(
  "/",
  requireAuth,
  requirePermission("pages.view"),
  getAllPages
);


/* ==========================================
   CMS WRITE OPERATIONS
========================================== */


/* ------------------------------------------
   CREATE PAGE
------------------------------------------ */

router.post(
  "/",
  requireAuth,
  requirePermission("pages.create"),
  requirePageAccessFromBody,
  createPage
);


/* ------------------------------------------
   UPDATE PAGE
------------------------------------------ */

router.put(
  "/:id",
  requireAuth,
  requirePermission("pages.edit"),
  requirePageAccessFromPage,
  updatePage
);


/* ------------------------------------------
   DELETE PAGE
----------------------------------------- */

router.delete(
  "/:id",
  requireAuth,
  requirePermission("pages.delete"),
  requirePageAccessFromPage,
  deletePage
);


/* ------------------------------------------
   PUBLISH / UNPUBLISH
------------------------------------------ */

router.patch(
  "/:id/publish",
  requireAuth,
  requirePermission("pages.edit"),
  requirePageAccessFromPage,
  togglePublishPage
);


export default router;