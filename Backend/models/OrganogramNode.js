import mongoose from "mongoose";

const OrganogramNodeSchema = new mongoose.Schema(
  {
    /* ==========================================
       BASIC INFO
    ========================================== */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================
       MEDIA / PHOTO
       Compatible with existing CMS Media objects & URLs
    ========================================== */

    photo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* ==========================================
       HIERARCHY / REPORTS TO
       Self-referential parent relation
       null = Top-level / Root node
    ========================================== */

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganogramNode",
      default: null,
    },

    /* ==========================================
       ORDERING & STATUS
    ========================================== */

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ==========================================
       OPTIONAL DETAILS / CONTACT
    ========================================== */

    email: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    level: {
      type: Number,
      default: 0,
    },

    /* ==========================================
       AUDIT TRACKING
    ========================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================
   INDEXES FOR HIGH PERFORMANCE
========================================== */

OrganogramNodeSchema.index({ parent: 1, order: 1 });
OrganogramNodeSchema.index({ isActive: 1 });

export default mongoose.models.OrganogramNode ||
  mongoose.model("OrganogramNode", OrganogramNodeSchema);
