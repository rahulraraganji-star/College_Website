import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    parentSlug: {
      type: String,
      default: null,
    },

    template: {
      type: String,
      default: "default",
      enum: ["default", "courses"],
    },

    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    courseData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    content: {
      type: Array,
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model("Page", PageSchema);