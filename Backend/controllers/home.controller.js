import Page from "../models/page.js";

export const getHome = async (req, res) => {
  try {
    const home = await Page.findOne({ slug: "home" });

    console.log("HOME DATA:", home);

    // ❌ if not found
    if (!home) {
      return res.status(404).json({
        message: "Home not found",
      });
    }

    // ❌ if sections missing
    if (!home.sections) {
      return res.status(404).json({
        message: "Sections missing",
      });
    }

    // ✅ ALWAYS SEND RESPONSE
    return res.status(200).json(home.sections);

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};