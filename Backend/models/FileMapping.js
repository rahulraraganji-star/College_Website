import mongoose from "mongoose";

const fileMappingSchema = new mongoose.Schema(
  {
    /* -----------------------------
        LEGACY FILE PATH
        Normalized legacy URL path
        (e.g., "/wp-content/uploads/2023/11/AQAR-2023.pdf")
    ----------------------------- */
    legacyPath: {
      type: String,
      required: [true, "Legacy path is required"],
      trim: true,
      unique: true,
    },

    /* -----------------------------
        DOCUMENT REFERENCE
        Foreign key to existing Media model
    ----------------------------- */
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: [true, "Document reference is required"],
      index: true,
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
fileMappingSchema.index({ active: 1, legacyPath: 1 });

export default mongoose.models.FileMapping ||
  mongoose.model("FileMapping", fileMappingSchema);
