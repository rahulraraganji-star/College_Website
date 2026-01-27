import NavigationMenu from "../models/NavigationMenu.js";
import NavigationItem from "../models/NavigationItem.js";

/**
 * GET /api/navigation
 * Returns all active menus and navigation items
 */
export const getNavigation = async (req, res) => {
  try {
    const menus = await NavigationMenu.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    const items = await NavigationItem.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    res.json({
      menus,
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load navigation",
    });
  }
};
