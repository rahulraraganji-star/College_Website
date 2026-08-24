import express from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
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


export default router;