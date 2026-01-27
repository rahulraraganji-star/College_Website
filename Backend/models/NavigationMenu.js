import mongoose from "mongoose";

const NavigationMenuSchema = new mongoose.Schema({
  title: String,
  slug: String,
  order: Number,
  isActive: Boolean,
});

export default mongoose.model("NavigationMenu", NavigationMenuSchema);
