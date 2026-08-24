import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import { applyApprovedChange } from "../services/approvalApplyService.js";


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
        .populate(
          "submittedBy",
          "name email role department"
        )
        .populate(
          "reviewedBy",
          "name email role"
        )
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
    console.error(
      "GET APPROVALS ERROR:",
      error
    );

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
    const approval =
      await ApprovalRequest.findById(
        req.params.id
      )
        .populate(
          "submittedBy",
          "name email role department"
        )
        .populate(
          "reviewedBy",
          "name email role department"
        )
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
    console.error(
      "GET APPROVAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch approval request.",
    });
  }
};


/* ==========================================
   APPROVE REQUEST
========================================== */

export const approveRequest = async (req, res) => {
  try {

    const { id } = req.params;


    /* ------------------------------------------
       AUTHORIZATION
    ------------------------------------------ */

    if (
      req.authUser.role !== "admin" &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin or Super Admin can approve requests.",
      });
    }


    /* ------------------------------------------
       FIND REQUEST
    ------------------------------------------ */

    const approval =
      await ApprovalRequest.findById(id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message:
          "Approval request not found.",
      });
    }


    /* ------------------------------------------
       CHECK STATUS
    ------------------------------------------ */

    if (approval.status !== "pending") {
      return res.status(409).json({
        success: false,
        message:
          "This approval request has already been reviewed.",
      });
    }


    /* ------------------------------------------
       APPLY CHANGE
    ------------------------------------------ */

    const appliedResource =
      await applyApprovedChange(
        approval
      );


    /* ------------------------------------------
       UPDATE APPROVAL
    ------------------------------------------ */

    approval.status = "approved";

    approval.reviewedBy =
      req.authUser._id;

    approval.reviewedByRole =
      req.authUser.role;

    approval.reviewedAt =
      new Date();

    approval.reviewComment =
      req.body?.comment?.trim() || "";

    await approval.save();


    /* ------------------------------------------
       UPDATE AUDIT LOG
    ------------------------------------------ */

    if (approval.auditLog) {

      await AuditLog.findByIdAndUpdate(
        approval.auditLog,
        {
          approvalStatus: "approved",
        }
      );
    }


    /* ------------------------------------------
       RESPONSE
    ------------------------------------------ */

    return res.json({
      success: true,
      message:
        "Approval request approved and change applied.",
      approval,
      resource: appliedResource,
    });

  } catch (error) {

    console.error(
      "APPROVE REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve request.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/* ==========================================
   REJECT REQUEST
========================================== */

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    /* ------------------------------------------
       AUTHORIZATION
    ------------------------------------------ */

    if (
      req.authUser.role !== "admin" &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin or Super Admin can reject requests.",
      });
    }


    /* ------------------------------------------
       FIND REQUEST
    ------------------------------------------ */

    const approval =
      await ApprovalRequest.findById(id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message:
          "Approval request not found.",
      });
    }


    /* ------------------------------------------
       CHECK STATUS
    ------------------------------------------ */

    if (approval.status !== "pending") {
      return res.status(409).json({
        success: false,
        message:
          "This approval request has already been reviewed.",
      });
    }


    /* ------------------------------------------
       REQUIRE REASON
    ------------------------------------------ */

    const reason = req.body?.comment?.trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }


    /* ------------------------------------------
       UPDATE APPROVAL
    ------------------------------------------ */

    approval.status = "rejected";

    approval.reviewedBy =
      req.authUser._id;

    approval.reviewedByRole =
      req.authUser.role;

    approval.reviewedAt =
      new Date();

    approval.reviewComment = reason;

    await approval.save();


    /* ------------------------------------------
       UPDATE AUDIT LOG
    ------------------------------------------ */

    if (approval.auditLog) {

      await AuditLog.findByIdAndUpdate(
        approval.auditLog,
        {
          approvalStatus: "rejected",
        }
      );
    }


    return res.json({
      success: true,
      message:
        "Approval request rejected.",
      approval,
    });

  } catch (error) {

    console.error(
      "REJECT REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject request.",
    });
  }
};