import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    /* -----------------------------
        BASIC INFO
    ----------------------------- */

    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    /* -----------------------------
        FILE DETAILS
    ----------------------------- */

    type: {
      type: String,
      enum: [
        "image",
        "document",
        "pdf",
        "video",
        "audio",
        "archive",
        "other",
      ],
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    extension: {
      type: String,
    },

    size: {
      type: Number,
      required: true,
    },

    /* -----------------------------
        IMAGE ONLY
    ----------------------------- */

    width: Number,

    height: Number,

    alt: {
      type: String,
      default: "",
    },

    /* -----------------------------
        ORGANIZATION
    ----------------------------- */

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    tags: [
      {
        type: String,
      },
    ],

    /* -----------------------------
        STATUS
    ----------------------------- */

    isPublic: {
      type: Boolean,
      default: true,
    },

    /* -----------------------------
        FUTURE
    ----------------------------- */

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Media",
  mediaSchema
);