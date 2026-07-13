import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "global",
  },

  header: {
    logo: String,
    collegeName: String,
    subtitle: String,
    tagline: String,
    menu: Array,
  },

  footer: {
    description: String,
    links: Array,
    socials: Array,
  },
});

export default mongoose.model("Settings", SettingsSchema);