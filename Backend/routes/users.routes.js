import express from "express";

import {
  createUser,
  assignRoleToUser,
} from "../controllers/userController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   CREATE USER
========================================== */

router.post(
  "/",
  requireAuth,
  requirePermission("users.create"),
  createUser
);


/* ==========================================
   ASSIGN ROLE
========================================== */

router.patch(
  "/:id/role",
  requireAuth,
  requirePermission("users.edit"),
  assignRoleToUser
);


export default router;