import Settings from "../models/Settings.js";

// ✅ named export
export const getHeader = async (req, res) => {
  try {
    const header = await Settings.findOne({ type: "header" });
    res.json(header);
  } catch (error) {
    res.status(500).json({ message: "Error fetching header" });
  }
};

// ✅ named export
export const getFooter = async (req, res) => {
  try {
    const footer = await Settings.findOne({ type: "footer" });
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching footer" });
  }
};