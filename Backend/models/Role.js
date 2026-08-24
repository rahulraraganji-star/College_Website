import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    /* ==========================================
       BASIC INFORMATION
    ========================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },


    /* ==========================================
       SYSTEM ROLE
       
       true  → Super Admin / Admin
       false → Custom role
    ========================================== */

    isSystemRole: {
      type: Boolean,
      default: false,
    },


    /* ==========================================
       SYSTEM ROLE TYPE
       
       Only used for system roles.
    ========================================== */

    systemRole: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        null,
      ],
      default: null,
    },


    /* ==========================================
       PERMISSIONS

       Example:

       [
         "pages.view",
         "pages.edit",
         "notices.view",
         "notices.create"
       ]
    ========================================== */

    permissions: {
      type: [String],
      default: [],
    },


    /* ==========================================
       ALLOWED PAGES / SCOPE

       Example:

       [
         "library",
         "ncc",
         "nss"
       ]

       "*" means all pages.
    ========================================== */

    allowedPages: {
      type: [String],
      default: [],
    },


    /* ==========================================
       ROLE STATUS
    ========================================== */

    isActive: {
      type: Boolean,
      default: true,
    },


    /* ==========================================
       CREATED BY

       Custom roles will remember who created them.
    ========================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Role ||
  mongoose.model("Role", RoleSchema);