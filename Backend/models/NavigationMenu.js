import mongoose from "mongoose";

const navigationMenuSchema = new mongoose.Schema({
  key: String,
  title: String,
  order: Number,
  isActive: Boolean,
  showInNavbar: Boolean,
});

/* Indexes for high performance navigation queries */
navigationMenuSchema.index({ key: 1 }, { unique: true });
navigationMenuSchema.index({ isActive: 1, showInNavbar: 1, order: 1 });

export default mongoose.model(
  "NavigationMenu",
  navigationMenuSchema,
  "Navigation_Menu"   // ← IMPORTANT
);
