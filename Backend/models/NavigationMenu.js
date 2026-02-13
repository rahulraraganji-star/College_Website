import mongoose from "mongoose";

const navigationMenuSchema = new mongoose.Schema({
  key: String,
  title: String,
  order: Number,
  isActive: Boolean,
  showInNavbar: Boolean,
});

export default mongoose.model(
  "NavigationMenu",
  navigationMenuSchema,
  "Navigation_Menu"   // ← IMPORTANT
);
