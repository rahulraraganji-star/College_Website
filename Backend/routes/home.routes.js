import express from "express";

import {
  getHome,
  updateHome,
} from "../controllers/home.Controller.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — website needs to read Home data
router.get("/", getHome);

// Protected — only authenticated CMS users can modify Home
router.put("/", requireAuth, updateHome);

export default router;