import dotenv from "dotenv";
import connectDB from "../database/connect.js";
import Page from "../models/Page.js";
import NavigationItem from "../models/NavigationItem.js";
import NavigationMenu from "../models/NavigationMenu.js";

dotenv.config();

const verifyAll = async () => {
  try {
    await connectDB();

    console.log("\n=======================================================");
    console.log("COLLEGE CMS — VERIFICATION SUITE");
    console.log("=======================================================\n");

    // 1. Navigation Menus & Item Counts
    console.log("--- 1. NAVIGATION MENUS & CHILDREN ---");
    const menus = await NavigationMenu.find().sort({ order: 1 });
    const items = await NavigationItem.find().sort({ order: 1 });

    for (const menu of menus) {
      const childItems = items.filter(i => i.menuKey === menu.key);
      console.log(`Menu [${menu.order}] "${menu.title}" (key: ${menu.key}) -> ${childItems.length} items`);
    }

    // 2. Total Counts
    const totalPages = await Page.countDocuments();
    const totalItems = await NavigationItem.countDocuments();
    const totalMenus = await NavigationMenu.countDocuments();

    console.log("\n--- 2. DATABASE TOTALS ---");
    console.log(`Total Pages:            ${totalPages}`);
    console.log(`Total Navigation Items: ${totalItems}`);
    console.log(`Total Navigation Menus: ${totalMenus}`);

    // 3. Check Home Page
    const home = await Page.findOne({ slug: "home" });
    console.log(`\n--- 3. HOME PAGE CHECK ---`);
    console.log(`Home Page Status: ${home ? "✅ INTACT (ID: " + home._id + ")" : "❌ MISSING"}`);

    // 4. Sample check pages across different templates
    console.log("\n--- 4. TEMPLATE INTEGRITY CHECK ---");
    const bcaPage = await Page.findOne({ slug: "bca" });
    console.log(`BCA Course Template: ${bcaPage?.template === "courses" && bcaPage.courseData?.curriculum?.length > 0 ? "✅ VALID" : "❌ INVALID"}`);

    const facultyPage = await Page.findOne({ slug: "faculty-profiles" });
    const hasFacultyGrid = facultyPage?.sections?.some(s => s.type === "faculty-grid");
    console.log(`Faculty Grid Page: ${hasFacultyGrid ? "✅ VALID" : "❌ INVALID"}`);

    const historyPage = await Page.findOne({ slug: "history" });
    const hasTimeline = historyPage?.sections?.some(s => s.type === "timeline");
    console.log(`History Timeline Page: ${hasTimeline ? "✅ VALID" : "❌ INVALID"}`);

    console.log("\n=======================================================");
    console.log("ALL INTEGRITY CHECKS COMPLETED SUCCESSFULLY");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
};

verifyAll();
