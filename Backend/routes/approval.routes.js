import express from "express";

import {
  getApprovals,
  getApprovalById,
  approveRequest,
  rejectRequest,
} from "../controllers/approvalController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   GET APPROVALS (supports ?status= filter)
========================================== */

router.get(
  "/",
  requireAuth,
  requirePermission("approvals.view"),
  getApprovals
);


/* ==========================================
   GET SINGLE APPROVAL
========================================== */

router.get(
  "/:id",
  requireAuth,
  requirePermission("approvals.view"),
  getApprovalById
);


/* ==========================================
   APPROVE
========================================== */

router.patch(
  "/:id/approve",
  requireAuth,
  requirePermission("approvals.approve"),
  approveRequest
);


/* ==========================================
   REJECT
========================================== */

router.patch(
  "/:id/reject",
  requireAuth,
  requirePermission("approvals.reject"),
  rejectRequest
);


export default router;