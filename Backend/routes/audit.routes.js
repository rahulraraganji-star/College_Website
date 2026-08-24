import express from "express";

import {
  getAuditLogs,
} from "../controllers/auditController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   GET AUDIT LOGS
========================================== */

router.get(
  "/",
  requireAuth,
  requirePermission("audit.view"),
  getAuditLogs
);


export default router;
