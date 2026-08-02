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

const router = express.Router();

/* 
   GET NAVIGATION
 */

router.get("/", getNavigation);

/* 
   admin 
 */
router.get(
  "/admin",
  getAdminNavigation
);

/**create menu */
router.post(
  "/menu",
  createMenu
);

router.patch(
  "/menu/:id",
  updateMenu
);


/* 
   DELETE menu
 */
router.delete(
  "/menu/:id",
  deleteMenu
);

/* 
   DELETE CHILD
 */

router.delete(
  "/child/:id",
  deleteChild
);

/* 
   Reorder menu
 */

router.patch(
  "/menu/:id/reorder",
  reorderMenu
);

/**update child */
router.patch(
  "/child/:id",
  updateChild
);


/* 
   Reorder items
 */

router.patch(
  "/child/:id/reorder",
  reorderChild
);

router.patch(
  "/child/:id/toggle",
  toggleChildVisibility
);

export default router;