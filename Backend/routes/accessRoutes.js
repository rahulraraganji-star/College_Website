import express from "express";

import {
  getAccessDefinitions,
} from "../controllers/accessController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// ACCESS DEFINITIONS
// ==========================================

router.get(
  "/",
  requireAuth,
  getAccessDefinitions
);


export default router;