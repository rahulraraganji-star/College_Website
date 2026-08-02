import NavigationMenu from "../models/NavigationMenu.js";
import NavigationItem from "../models/NavigationItem.js";
import Page from "../models/Page.js";

/**
 * GET /api/navigation
 * Returns all active menus and navigation items
 */
export const getNavigation = async (req, res) => {
  try {

    const menus = await NavigationMenu.find({
      isActive: true,
      showInNavbar: true,
    })
      .sort({ order: 1 })
      .lean();

    const items = await NavigationItem.find({
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

      console.log("Menus");
console.log(menus);

console.log("Items");
console.log(items);

    const navigation = menus.map((menu) => ({
      ...menu,
      children: items.filter(
        (item) => item.menuKey === menu.key
      ),
    }));

    res.json(navigation);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to load navigation",
    });

  }
};


export const getAdminNavigation = async (req, res) => {
  try {

    const menus = await NavigationMenu.find()
      .sort({ order: 1 })
      .lean();

    const items = await NavigationItem.find()
      .sort({ order: 1 })
      .lean();

    const navigation = menus.map((menu) => ({
      ...menu,
      children: items.filter(
        (item) => item.menuKey === menu.key
      ),
    }));

    res.json(navigation);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to load navigation",
    });

  }
};

/* ==========================================
   DELETE CHILD
========================================== */

export const deleteChild = async (req, res) => {
  try {

    const child = await NavigationItem.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    // Delete the page first
    if (child.pageId) {
      await Page.findByIdAndDelete(child.pageId);
    }

    // Delete navigation item
    await NavigationItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to delete page",
    });

  }
};
/* ==========================================
   REORDER CHILD
========================================== */

export const reorderChild = async (req, res) => {
  try {

    const { id } = req.params;
    const { direction } = req.body;

    const current = await NavigationItem.findById(id);

    if (!current) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    const operator =
      direction === "up" ? "$lt" : "$gt";

    const sort =
      direction === "up" ? -1 : 1;

    const swapWith =
      await NavigationItem.findOne({
        menuKey: current.menuKey,
        order: { [operator]: current.order },
      }).sort({ order: sort });

    if (!swapWith) {
      return res.json({
        success: true,
      });
    }

    const temp = current.order;

    current.order = swapWith.order;
    swapWith.order = temp;

    await current.save();
    await swapWith.save();

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to reorder child",
    });

  }
};

/* ==========================================
   CREATE MENU
========================================== */

export const createMenu = async (req, res) => {
  try {
    const {
      title,
      showInNavbar,
    } = req.body;

    // Generate key and slug from title
    const key = title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const slug = `/${key}`;

    // Prevent duplicate key
    const existing = await NavigationMenu.findOne({
      key,
    });

    if (existing) {
      return res.status(400).json({
        message: "Menu key already exists",
      });
    }

    // Next order
    const lastMenu = await NavigationMenu.findOne()
      .sort({ order: -1 });

    const order = lastMenu
      ? lastMenu.order + 1
      : 1;

    const menu = await NavigationMenu.create({
      title,
      key,
      slug,
      order,
      isActive: true,
      showInNavbar,
    });

    res.status(201).json(menu);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to create menu",
    });

  }
};

/* ==========================================
   UPDATE MENU
========================================== */

export const updateMenu = async (req, res) => {
  try {

    const menu = await NavigationMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }

    menu.title = req.body.title;
    menu.showInNavbar = req.body.showInNavbar;

    await menu.save();

    res.json(menu);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update menu",
    });

  }
};


/* ==========================================
   DELETE MENU
========================================== */

export const deleteMenu = async (req, res) => {
  try {

    const menu = await NavigationMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }

    const childCount = await NavigationItem.countDocuments({
      menuKey: menu.key,
    });

    if (childCount > 0) {
  return res.status(400).json({
    message: `Cannot delete "${menu.title}". It contains ${childCount} child ${
      childCount === 1 ? "page" : "pages"
    }. Remove or move them first.`,
  });
}

    await menu.deleteOne();

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to delete menu",
    });

  }
};


/* ==========================================
   REORDER MENU
========================================== */

export const reorderMenu = async (req, res) => {
  try {

    const { id } = req.params;
    const { direction } = req.body;

    const current = await NavigationMenu.findById(id);

    if (!current) {
      return res.status(404).json({
        message: "Menu not found",
      });
    }

    const operator =
      direction === "up" ? "$lt" : "$gt";

    const sort =
      direction === "up" ? -1 : 1;

    const swapWith =
      await NavigationMenu.findOne({
        order: {
          [operator]: current.order,
        },
      }).sort({
        order: sort,
      });

    if (!swapWith) {
      return res.json({
        success: true,
      });
    }

    const temp = current.order;

    current.order = swapWith.order;
    swapWith.order = temp;

    await current.save();
    await swapWith.save();

    res.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to reorder menu",
    });

  }
};

/* ==========================================
   TOGGLE CHILD VISIBILITY
========================================== */

export const toggleChildVisibility = async (req, res) => {
  try {

    const child = await NavigationItem.findById(req.params.id);

    console.log("Before:", child.isActive);

    if (!child) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    child.isActive = !child.isActive;

    console.log("After:", child.isActive);

    try {
      await child.save();
      console.log("Saved successfully");
    } catch (err) {
      console.error("SAVE ERROR");
      console.error(err);
      throw err;
    }

    res.json({
      success: true,
      child,
    });

  } catch (error) {

    console.error("OUTER ERROR");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/**Update child */

export const updateChild = async (req, res) => {
  try {

    const child = await NavigationItem.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        message: "Navigation item not found",
      });
    }

    child.label = req.body.label;
    child.slug = req.body.slug;
    child.icon = req.body.icon;
    child.isActive = req.body.isActive;

    await child.save();

    res.json({
      success: true,
      child,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update navigation item",
    });

  }
};