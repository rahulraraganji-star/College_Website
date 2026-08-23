import express from "express";

import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePageAccess,
} from "../middleware/scopeMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   PAGE SCOPE TEST
========================================== */

router.get(
  "/scope-test/:scope",
  requireAuth,
  requirePageAccess(
    (req) => req.params.scope
  ),
  (req, res) => {
    return res.json({
      success: true,
      message: "Page scope check passed.",
      user: req.authUser.name,
      role: req.authRole.name,
      pageScope: req.pageScope,
    });
  }
);


/* ==========================================
   GET ALL ROLES
========================================== */

router.get(
  "/",
  requireAuth,
  requirePermission("roles.view"),
  getRoles
);


/* ==========================================
   GET SINGLE ROLE
========================================== */

router.get(
  "/:id",
  requireAuth,
  requirePermission("roles.view"),
  getRoleById
);


/* ==========================================
   CREATE ROLE
========================================== */

router.post(
  "/",
  requireAuth,
  requirePermission("roles.create"),
  createRole
);


/* ==========================================
   UPDATE ROLE
========================================== */

router.patch(
  "/:id",
  requireAuth,
  requirePermission("roles.edit"),
  updateRole
);


/* ==========================================
   DELETE ROLE
========================================== */

router.delete(
  "/:id",
  requireAuth,
  requirePermission("roles.delete"),
  deleteRole
);


export default router;