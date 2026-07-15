import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    /* -----------------------------
        BASIC INFO
    ----------------------------- */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },

    /* -----------------------------
        HIERARCHY
    ----------------------------- */

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    /* -----------------------------
        OPTIONAL DETAILS
    ----------------------------- */

    description: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#F59E0B",
    },

    icon: {
      type: String,
      default: "folder",
    },

    /* -----------------------------
        PERMISSIONS
    ----------------------------- */

    isPublic: {
      type: Boolean,
      default: true,
    },

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

/* -----------------------------
    AUTO GENERATE SLUG
----------------------------- */

folderSchema.pre("validate", function (next) {

  if (this.name) {

    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  }

  next();

});

/* -----------------------------
    INDEXES
----------------------------- */

// Faster lookup of folders inside a parent
folderSchema.index({
  parent: 1,
  name: 1,
});

/* -----------------------------
    EXPORT
----------------------------- */

export default mongoose.model(
  "Folder",
  folderSchema
);