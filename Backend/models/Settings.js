import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // "header" or "footer"

    // header fields
    logo: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    tagline: { type: String, default: "" },

    // footer fields
    brand: { type: String, default: "" },
    description: { type: String, default: "" },
    addressLines: [{ type: String }],
    phone: { type: String, default: "" },
    email: { type: String, default: "" },

    quickLinks: [
      {
        name: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    supportLinks: [
      {
        name: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    socials: [
      {
        name: { type: String, default: "" },
        icon: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    mapEmbedUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);