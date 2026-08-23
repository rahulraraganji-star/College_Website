import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    // ==========================================
    // ACCOUNT
    // ==========================================

    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "department_editor",
      ],
      default: "department_editor",
    },

    /*
     * Existing role system.
     *
     * We keep this because Roles are still useful
     * for reusable permission templates.
     *
     * Create User will NOT require selecting a role.
     */

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },

    // ==========================================
    // CUSTOM ACCESS - PERMISSIONS
    // ==========================================

    /*
     * Permissions assigned directly to this user.
     *
     * Example:
     *
     * [
     *   "pages.view",
     *   "pages.edit"
     * ]
     */

    permissions: {
      type: [String],
      default: [],
    },

    /*
     * Page/section scopes assigned directly to this user.
     *
     * Example:
     *
     * [
     *   "nss"
     * ]
     */

    allowedPages: {
      type: [String],
      default: [],
    },

    /*
     * Granular content access control per page.
     *
     * This allows users to have access to specific sections
     * within a page, rather than the entire page.
     *
     * Example:
     *
     * [
     *   {
     *     pageSlug: "nss",
     *     sectionIds: ["section_123", "section_456"]
     *   }
     * ]
     */

    contentAccess: {
      type: [
        {
          pageSlug: {
            type: String,
            required: true,
            trim: true,
          },

          sectionIds: {
            type: [String],
            default: [],
          },
        },
      ],

      default: [],
    },

    department: {
      type: String,
      default: null,
      trim: true,
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "suspended",
      ],
      default: "pending",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ACCOUNT MANAGEMENT
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", userSchema);