import express from "express";

import {
  getNavigation,
  getAdminNavigation,
  deleteChild,
  reorderChild,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenu,
  toggleChildVisibility,
  updateChild,
} from "../controllers/navigation.controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   PUBLIC NAVIGATION
========================================== */

/*
   Public website needs navigation.
   DO NOT protect this route.
*/

router.get(
  "/",
  getNavigation
);


/* ==========================================
   CMS NAVIGATION
========================================== */


/* ------------------------------------------
   ADMIN NAVIGATION VIEW
------------------------------------------ */

router.get(
  "/admin",
  requireAuth,
  requirePermission("navigation.view"),
  getAdminNavigation
);


/* ------------------------------------------
   CREATE MENU
------------------------------------------ */

router.post(
  "/menu",
  requireAuth,
  requirePermission("navigation.edit"),
  createMenu
);


/* ------------------------------------------
   UPDATE MENU
------------------------------------------ */

router.patch(
  "/menu/:id",
  requireAuth,
  requirePermission("navigation.edit"),
  updateMenu
);


/* ------------------------------------------
   DELETE MENU
------------------------------------------ */

router.delete(
  "/menu/:id",
  requireAuth,
  requirePermission("navigation.edit"),
  deleteMenu
);


/* ------------------------------------------
   DELETE CHILD
------------------------------------------ */

router.delete(
  "/child/:id",
  requireAuth,
  requirePermission("navigation.edit"),
  deleteChild
);


/* ------------------------------------------
   REORDER MENU
------------------------------------------ */

router.patch(
  "/menu/:id/reorder",
  requireAuth,
  requirePermission("navigation.edit"),
  reorderMenu
);


/* ------------------------------------------
   UPDATE CHILD
------------------------------------------ */

router.patch(
  "/child/:id",
  requireAuth,
  requirePermission("navigation.edit"),
  updateChild
);


/* ------------------------------------------
   REORDER CHILD
------------------------------------------ */

router.patch(
  "/child/:id/reorder",
  requireAuth,
  requirePermission("navigation.edit"),
  reorderChild
);


/* ------------------------------------------
   TOGGLE CHILD VISIBILITY
------------------------------------------ */

router.patch(
  "/child/:id/toggle",
  requireAuth,
  requirePermission("navigation.edit"),
  toggleChildVisibility
);


export default router;