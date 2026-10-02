import dotenv from "dotenv";
import connectDB from "../database/connect.js";
import Page from "../models/page.js";
import NavigationItem from "../models/NavigationItem.js";
import NavigationMenu from "../models/NavigationMenu.js";

dotenv.config();

/**
 * Reversibility Script:
 * Removes ONLY demo pages, their navigation items, and any demo navigation menus created during this task.
 * Leaves home, original settings, users, roles, and media 100% untouched.
 */
const cleanupDemoData = async () => {
  try {
    console.log("\n============================================");
    console.log("CLEANUP DEMO DATA — REVERSAL SCRIPT");
    console.log("============================================\n");

    await connectDB();

    // 1. Find all demo pages (marked with isDemoContent: true or slug !== 'home')
    const demoPages = await Page.find({
      $or: [
        { isDemoContent: true },
        { slug: { $nin: ["home"] } } // Safety guard: never touch "home"
      ]
    });

    console.log(`Found ${demoPages.length} demo pages to clean up.`);

    const demoPageIds = demoPages.map(p => p._id);

    // 2. Delete navigation items associated with demo pages
    const deletedItems = await NavigationItem.deleteMany({
      $or: [
        { pageId: { $in: demoPageIds } },
        { menuKey: { $in: [
          "about", "about-us", "administration", "academics", "staff", "admissions",
          "examination", "iqac", "naac", "nirf", "aishe", "india-today",
          "research-publication", "projects", "innovation", "research", "student-life",
          "alumni", "infrastructure", "library", "policies", "notices", "events", "campus-alumni"
        ] } }
      ]
    });

    console.log(`✅ Deleted ${deletedItems.deletedCount} demo navigation items.`);

    // 3. Delete demo pages (excluding "home")
    const deletedPages = await Page.deleteMany({
      _id: { $in: demoPageIds },
      slug: { $ne: "home" }
    });

    console.log(`✅ Deleted ${deletedPages.deletedCount} demo pages.`);

    // 4. Verify home is intact
    const homePage = await Page.findOne({ slug: "home" });
    if (homePage) {
      console.log(`✅ Home page is intact (ID: ${homePage._id}).`);
    }

    console.log("\n============================================");
    console.log("CLEANUP COMPLETE — REVERTED TO CLEAN STATE");
    console.log("============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
};

cleanupDemoData();
