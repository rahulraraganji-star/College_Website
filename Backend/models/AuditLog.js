import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    /* ==========================================
       WHO
    ========================================== */

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "department_editor",
      ],
      required: true,
    },

    actorDepartment: {
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
       CHANGES
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
       APPROVAL
    ========================================== */

    approvalRequired: {
      type: Boolean,
      default: false,
    },

    approvalStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "approved",
        "rejected",
      ],
      default: "not_required",
    },

    approvalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovalRequest",
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
========================================= */

auditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

auditLogSchema.index({
  resourceType: 1,
  resourceId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  approvalStatus: 1,
  createdAt: -1,
});


export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);