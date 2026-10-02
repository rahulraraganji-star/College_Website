import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import {
  getAnalyticsData,
  getPublicAnalyticsConfig,
  updateAnalyticsConfig,
} from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   PUBLIC ANALYTICS CONFIG (FOR FRONTEND GTAG)
========================================== */
router.get("/analytics/public-config", getPublicAnalyticsConfig);

/* ==========================================
   GET DASHBOARD METRICS & STATS
========================================== */
router.get("/stats", requireAuth, getDashboardStats);

/* ==========================================
   GOOGLE ANALYTICS DATA & CONFIG
========================================== */
router.get("/analytics", requireAuth, getAnalyticsData);
router.put("/analytics/config", requireAuth, updateAnalyticsConfig);

export default router;

