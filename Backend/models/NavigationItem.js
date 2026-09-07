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

/* Indexes for high performance navigation queries */
navigationItemSchema.index({ isActive: 1, order: 1 });
navigationItemSchema.index({ menuKey: 1, order: 1 });
navigationItemSchema.index({ pageId: 1 });

export default mongoose.model(
  "NavigationItem",
  navigationItemSchema,
  "Navigation_Items"   
);