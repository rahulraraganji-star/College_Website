import express from "express";

import {
  login,
  logout,
  getMe,
  changePassword,
  updateEmail,
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.post("/login", login);

// ==========================================
// PROTECTED
// ==========================================

router.post("/logout", requireAuth, logout);

router.get("/me", requireAuth, getMe);

router.post("/change-password", requireAuth, changePassword);

router.post("/update-email", requireAuth, updateEmail);

export default router;