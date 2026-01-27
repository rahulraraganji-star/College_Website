import mongoose from "mongoose";

const NavigationItemSchema = new mongoose.Schema({
  menuSlug: String,
  label: String,
  href: String,
  slug: String,
  parentSlug: String,
  order: Number,
  icon: String,
  isActive: Boolean,
});

export default mongoose.model("NavigationItem", NavigationItemSchema);
