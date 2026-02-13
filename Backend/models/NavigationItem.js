import mongoose from "mongoose";

const navigationItemSchema = new mongoose.Schema({
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
  "Navigation_Items"   // ← IMPORTANT
);
