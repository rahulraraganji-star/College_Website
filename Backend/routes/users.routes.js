import express from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRoleToUser,
  resetUserPassword,
} from "../controllers/userController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   LIST USERS
========================================== */

router.get(
  "/",
  requireAuth,
  requirePermission("users.view"),
  getUsers
);


/* ==========================================
   GET SINGLE USER
========================================== */

router.get(
  "/:userId",
  requireAuth,
  requirePermission("users.view"),
  getUserById
);


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
   UPDATE USER
========================================== */

router.put(
  "/:userId",
  requireAuth,
  requirePermission("users.edit"),
  updateUser
);


/* ==========================================
   DELETE USER
========================================== */

router.delete(
  "/:userId",
  requireAuth,
  requirePermission("users.delete"),
  deleteUser
);


/* ==========================================
   ASSIGN ROLE
========================================== */

router.patch(
  "/:userId/role",
  requireAuth,
  requirePermission("users.edit"),
  assignRoleToUser
);


/* ==========================================
   RESET USER PASSWORD (ADMIN / SUPER ADMIN)
========================================== */

router.post(
  "/:userId/reset-password",
  requireAuth,
  requirePermission("users.edit"),
  resetUserPassword
);


export default router;