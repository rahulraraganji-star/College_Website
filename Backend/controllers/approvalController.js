import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import { applyApprovedChange } from "../services/approvalApplyService.js";


/* ==========================================
   GET PENDING APPROVALS
========================================== */

export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await ApprovalRequest.find({
      status: "pending",
    })
      .populate(
        "submittedBy",
        "name email role department"
      )
      .populate(
        "auditLog"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      approvals,
    });

  } catch (error) {

    console.error(
      "GET PENDING APPROVALS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch pending approvals.",
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
      message:
        "Failed to fetch approval request.",
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
       UPDATE APPROVAL
    ------------------------------------------ */

    approval.status = "rejected";

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