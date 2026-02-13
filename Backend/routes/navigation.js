import express from "express";
import NavigationMenu from "../models/NavigationMenu.js";
import NavigationItem from "../models/NavigationItem.js";

const router = express.Router();

/**
 * GET /api/navigation
 * Returns menus with their items attached
 */
router.get("/", async (req, res) => {
  try {
    // Get active menus
    const menus = await NavigationMenu.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Get active items
    const items = await NavigationItem.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Attach items to their menus
    const menusWithItems = menus.map((menu) => ({
      ...menu,
      items: items.filter((item) => item.menuKey === menu.key),
    }));

    res.json(menusWithItems);
  } catch (error) {
    console.error("Navigation API error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
