import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { applyApprovedChange } from "../services/approvalApplyService.js";
import {
  sendApprovalNotificationToUser,
  sendRejectionNotificationToUser,
} from "../services/emailService.js";

/* ==========================================
   GET APPROVALS (with optional status filter)
========================================== */

export const getApprovals = async (req, res) => {
  try {
    const {
      status = "pending",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    const VALID_STATUSES = ["pending", "approved", "rejected"];

    if (status !== "all" && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    const [approvals, total] = await Promise.all([
      ApprovalRequest.find(filter)
        .populate("submittedBy", "name email role department")
        .populate("reviewedBy", "name email role department")
        .populate("auditLog")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      ApprovalRequest.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      approvals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("GET APPROVALS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch approvals.",
    });
  }
};

/* ==========================================
   GET SINGLE APPROVAL
========================================== */

export const getApprovalById = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findById(req.params.id)
      .populate("submittedBy", "name email role department")
      .populate("reviewedBy", "name email role department")
      .populate("auditLog");

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found.",
      });
    }

    return res.json({
      success: true,
      approval,
    });

  } catch (error) {
    console.error("GET APPROVAL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch approval request.",
    });
  }
};

/* ==========================================
   APPROVE REQUEST (FIRST DECISION WINS / ATOMIC)
========================================== */

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    /* ------------------------------------------
       AUTHORIZATION CHECK
    ------------------------------------------ */

    if (
      req.authUser.role !== "admin" &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Super Admin can approve requests.",
      });
    }

    /* ------------------------------------------
       PRE-CHECK SEPARATION OF DUTIES
    ------------------------------------------ */

    const existingBefore = await ApprovalRequest.findById(id);

    if (!existingBefore) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found.",
      });
    }

    if (
      existingBefore.submittedBy?.toString() === req.authUser._id.toString() &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot approve your own submission. Another administrator must review this request.",
      });
    }

    /* ------------------------------------------
       ATOMIC STATE TRANSITION (FIRST DECISION WINS)
    ------------------------------------------ */

    const reviewComment = req.body?.comment?.trim() || "";

    const approval = await ApprovalRequest.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          reviewedBy: req.authUser._id,
          reviewedByRole: req.authUser.role,
          reviewedAt: new Date(),
          reviewComment,
        },
      },
      { new: true }
    );

    if (!approval) {
      const alreadyReviewed = await ApprovalRequest.findById(id).populate("reviewedBy", "name email role");
      if (!alreadyReviewed) {
        return res.status(404).json({
          success: false,
          message: "Approval request not found.",
        });
      }

      return res.status(409).json({
        success: false,
        message: `This approval request has already been ${alreadyReviewed.status} by ${alreadyReviewed.reviewedBy?.name || alreadyReviewed.reviewedByRole || "an administrator"}.`,
        status: alreadyReviewed.status,
        reviewedBy: alreadyReviewed.reviewedBy?.name || alreadyReviewed.reviewedByRole,
        reviewedAt: alreadyReviewed.reviewedAt,
      });
    }

    /* ------------------------------------------
       APPLY APPROVED CHANGE
    ------------------------------------------ */

    const appliedResource = await applyApprovedChange(approval);

    /* ------------------------------------------
       UPDATE LINKED AUDIT LOG
    ------------------------------------------ */

    if (approval.auditLog) {
      await AuditLog.findByIdAndUpdate(approval.auditLog, {
        approvalStatus: "approved",
      });
    }

    /* ------------------------------------------
       ASYNC USER NOTIFICATION (NON-BLOCKING)
    ------------------------------------------ */

    User.findById(approval.submittedBy)
      .select("name email role")
      .then((submitterUser) => {
        if (submitterUser) {
          sendApprovalNotificationToUser({
            approvalRequest: approval,
            submitter: submitterUser,
            approver: req.authUser,
          });
        }
      })
      .catch((emailErr) => {
        console.error("ASYNC APPROVAL EMAIL NOTIFICATION ERROR:", emailErr.message);
      });

    return res.json({
      success: true,
      message: "Approval request approved and change applied.",
      approval,
      resource: appliedResource,
    });

  } catch (error) {
    console.error("APPROVE REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve request.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ==========================================
   REJECT REQUEST (FIRST DECISION WINS / ATOMIC)
========================================== */

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    /* ------------------------------------------
       AUTHORIZATION CHECK
    ------------------------------------------ */

    if (
      req.authUser.role !== "admin" &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Super Admin can reject requests.",
      });
    }

    /* ------------------------------------------
       REQUIRED REJECTION REASON VALIDATION
    ------------------------------------------ */

    const reason = req.body?.comment?.trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    /* ------------------------------------------
       ATOMIC STATE TRANSITION (FIRST DECISION WINS)
    ------------------------------------------ */

    const approval = await ApprovalRequest.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          reviewedBy: req.authUser._id,
          reviewedByRole: req.authUser.role,
          reviewedAt: new Date(),
          reviewComment: reason,
        },
      },
      { new: true }
    );

    if (!approval) {
      const alreadyReviewed = await ApprovalRequest.findById(id).populate("reviewedBy", "name email role");
      if (!alreadyReviewed) {
        return res.status(404).json({
          success: false,
          message: "Approval request not found.",
        });
      }

      return res.status(409).json({
        success: false,
        message: `This approval request has already been ${alreadyReviewed.status} by ${alreadyReviewed.reviewedBy?.name || alreadyReviewed.reviewedByRole || "an administrator"}.`,
        status: alreadyReviewed.status,
        reviewedBy: alreadyReviewed.reviewedBy?.name || alreadyReviewed.reviewedByRole,
        reviewedAt: alreadyReviewed.reviewedAt,
        reviewComment: alreadyReviewed.reviewComment,
      });
    }

    /* ------------------------------------------
       UPDATE LINKED AUDIT LOG
    ------------------------------------------ */

    if (approval.auditLog) {
      await AuditLog.findByIdAndUpdate(approval.auditLog, {
        approvalStatus: "rejected",
        rejectionReason: reason,
      });
    }

    /* ------------------------------------------
       ASYNC USER NOTIFICATION (NON-BLOCKING)
    ------------------------------------------ */

    User.findById(approval.submittedBy)
      .select("name email role")
      .then((submitterUser) => {
        if (submitterUser) {
          sendRejectionNotificationToUser({
            approvalRequest: approval,
            submitter: submitterUser,
            approver: req.authUser,
            reason,
          });
        }
      })
      .catch((emailErr) => {
        console.error("ASYNC REJECTION EMAIL NOTIFICATION ERROR:", emailErr.message);
      });

    return res.json({
      success: true,
      message: "Approval request rejected.",
      approval,
    });

  } catch (error) {
    console.error("REJECT REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject request.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};