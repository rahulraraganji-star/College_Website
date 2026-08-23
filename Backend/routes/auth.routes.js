import express from "express";

import {
  login,
  logout,
  getMe,
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

export default router;