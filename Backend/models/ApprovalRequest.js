import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    /* ==========================================
       WHO SUBMITTED THE CHANGE
    ========================================== */

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    submittedByRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "department_editor",
      ],
      required: true,
    },

    submittedByDepartment: {
      type: String,
      default: null,
      trim: true,
    },


    /* ==========================================
       WHAT RESOURCE
    ========================================== */

    resourceType: {
      type: String,
      required: true,
      trim: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    resourceName: {
      type: String,
      default: null,
      trim: true,
    },


    /* ==========================================
       WHAT ACTION
    ========================================== */

    action: {
      type: String,
      required: true,
      trim: true,
    },


    /* ==========================================
       PROPOSED CHANGE
    ========================================== */

    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },


    /* ==========================================
       APPROVAL STATUS
    ========================================== */

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },


    /* ==========================================
       REVIEWER
    ========================================== */

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedByRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "department_editor",
      ],
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewComment: {
      type: String,
      default: "",
      trim: true,
    },


    /* ==========================================
       LINK TO AUDIT LOG
    ========================================== */

    auditLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuditLog",
      default: null,
    },


    /* ==========================================
       METADATA
    ========================================== */

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


/* ==========================================
   INDEXES
========================================== */

approvalRequestSchema.index({
  submittedBy: 1,
  createdAt: -1,
});

approvalRequestSchema.index({
  status: 1,
  createdAt: -1,
});

approvalRequestSchema.index({
  resourceType: 1,
  resourceId: 1,
});


export default mongoose.models.ApprovalRequest ||
  mongoose.model(
    "ApprovalRequest",
    approvalRequestSchema
  );