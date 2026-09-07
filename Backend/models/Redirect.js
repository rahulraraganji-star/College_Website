import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
  {
    /* -----------------------------
        SOURCE PATH
        Normalized legacy URL path
        (e.g., "/academics/computer-science")
    ----------------------------- */
    sourcePath: {
      type: String,
      required: [true, "Source path is required"],
      trim: true,
      unique: true,
    },

    /* -----------------------------
        DESTINATION
        New relative page or external URL
        (e.g., "/departments/computer-science" or "https://...")
    ----------------------------- */
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },

    /* -----------------------------
        STATUS CODE
        301 (Permanent) or 302 (Temporary)
    ----------------------------- */
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
      required: true,
    },

    /* -----------------------------
        STATUS
    ----------------------------- */
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* -----------------------------
        DESCRIPTION / REASON
    ----------------------------- */
    description: {
      type: String,
      default: "",
      trim: true,
    },

    /* -----------------------------
        LIGHTWEIGHT ANALYTICS
    ----------------------------- */
    hitCount: {
      type: Number,
      default: 0,
    },

    lastResolvedAt: {
      type: Date,
      default: null,
    },

    /* -----------------------------
        AUDIT REFERENCES
    ----------------------------- */
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

/* Compound index for active lookups */
redirectSchema.index({ active: 1, sourcePath: 1 });

export default mongoose.models.Redirect ||
  mongoose.model("Redirect", redirectSchema);
