import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "header" or "footer"

  // header fields
  logo: String,
  title: String,
  subtitle: String,
  tagline: String,

  // footer fields
  brand: String,
  description: String,
  addressLines: [String],
  phone: String,
  email: String,

  quickLinks: [
    {
      name: String,
      url: String,
    },
  ],

  supportLinks: [
    {
      name: String,
      url: String,
    },
  ],

  socials: [
    {
      name: String,
      icon: String,
      url: String,
    },
  ],

  mapEmbedUrl: String,
});

export default mongoose.model("Settings", settingsSchema);