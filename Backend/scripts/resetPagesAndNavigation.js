import dotenv from "dotenv";
import connectDB from "../database/connect.js";

import Page from "../models/Page.js";
import NavigationItem from "../models/NavigationItem.js";
import NavigationMenu from "../models/NavigationMenu.js";

dotenv.config();

const resetPagesAndNavigation = async () => {
  try {
    console.log("\n=================================");
    console.log("PAGE + NAVIGATION RESET");
    console.log("=================================\n");

    await connectDB();

    // -----------------------------------------
    // COUNT BEFORE DELETE
    // -----------------------------------------

    const pageCount = await Page.countDocuments();
    const itemCount = await NavigationItem.countDocuments();
    const menuCount = await NavigationMenu.countDocuments();

    console.log("Current database:");
    console.log(`Pages:              ${pageCount}`);
    console.log(`Navigation Items:   ${itemCount}`);
    console.log(`Navigation Menus:   ${menuCount}`);

    console.log("\nDeleting ONLY:");
    console.log("- Page");
    console.log("- Navigation_Items");
    console.log("- Navigation_Menu");

    console.log("\nKeeping:");
    console.log("- Users");
    console.log("- Media");
    console.log("- Folders");
    console.log("- Home");
    console.log("- Settings");

    // -----------------------------------------
    // DELETE ALL NAVIGATION ITEMS
    // -----------------------------------------

    const deletedItems =
      await NavigationItem.deleteMany({});

    console.log(
      `\n✅ Deleted ${deletedItems.deletedCount} navigation items`
    );

    // -----------------------------------------
    // DELETE ALL NAVIGATION MENUS
    // -----------------------------------------

    const deletedMenus =
      await NavigationMenu.deleteMany({});

    console.log(
      `✅ Deleted ${deletedMenus.deletedCount} navigation menus`
    );

    // -----------------------------------------
    // DELETE ALL PAGES
    // -----------------------------------------

    const deletedPages =
      await Page.deleteMany({});

    console.log(
      `✅ Deleted ${deletedPages.deletedCount} pages`
    );

    // -----------------------------------------
    // VERIFY
    // -----------------------------------------

    const remainingPages =
      await Page.countDocuments();

    const remainingItems =
      await NavigationItem.countDocuments();

    const remainingMenus =
      await NavigationMenu.countDocuments();

    console.log("\n=================================");
    console.log("RESET COMPLETE");
    console.log("=================================\n");

    console.log(`Remaining Pages:            ${remainingPages}`);
    console.log(`Remaining Navigation Items: ${remainingItems}`);
    console.log(`Remaining Navigation Menus: ${remainingMenus}`);

    process.exit(0);

  } catch (error) {

    console.error("\n❌ RESET FAILED");
    console.error(error);

    process.exit(1);
  }
};

resetPagesAndNavigation();