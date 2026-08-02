import mongoose from "mongoose";

const navigationItemSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
  },
  menuKey: String,
  label: String,
  slug: String,
  icon: String,
  order: Number,
  isActive: Boolean,
});

export default mongoose.model(
  "NavigationItem",
  navigationItemSchema,
  "Navigation_Items"   
);