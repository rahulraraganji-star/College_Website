import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { EJSON } from "bson";

import connectDB from "../database/connect.js";
import Page from "../models/Page.js";

dotenv.config();

const restoreHome = async () => {
  try {
    console.log("\n=================================");
    console.log("RESTORING HOME PAGE");
    console.log("=================================\n");

    await connectDB();

    // -----------------------------------------
    // BACKUP FILE
    // -----------------------------------------

    const filePath = path.join(
      process.cwd(),
      "backup",
      "home.json"
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Home backup not found at:\n${filePath}`
      );
    }

    console.log("✅ Backup file found.");

    // -----------------------------------------
    // READ EXTENDED JSON
    // -----------------------------------------

    const rawData =
      fs.readFileSync(
        filePath,
        "utf-8"
      );

    const homeData =
      EJSON.parse(rawData);

    // -----------------------------------------
    // SAFETY CHECK
    // -----------------------------------------

    if (homeData.slug !== "home") {
      throw new Error(
        `Safety check failed. Expected slug "home", got "${homeData.slug}".`
      );
    }

    if (homeData.title !== "Home") {
      console.log(
        `⚠️ Home title is "${homeData.title}".`
      );
    }

    console.log(
      `Home ID: ${homeData._id}`
    );

    console.log(
      `Home slug: ${homeData.slug}`
    );

    // -----------------------------------------
    // CHECK IF HOME ALREADY EXISTS
    // -----------------------------------------

    const existingHome =
      await Page.findOne({
        slug: "home",
      });

    if (existingHome) {
      console.log(
        "\n⚠️ Home page already exists."
      );

      console.log(
        "Restore cancelled. Nothing was changed."
      );

      process.exit(0);
    }

    // -----------------------------------------
    // INSERT HOME
    // -----------------------------------------

    const restoredHome =
      await Page.create(homeData);

    // -----------------------------------------
    // VERIFY
    // -----------------------------------------

    const verifiedHome =
      await Page.findOne({
        slug: "home",
      });

    if (!verifiedHome) {
      throw new Error(
        "Home page could not be verified after restore."
      );
    }

    console.log("\n=================================");
    console.log("HOME RESTORED SUCCESSFULLY");
    console.log("=================================\n");

    console.log(
      `ID: ${verifiedHome._id}`
    );

    console.log(
      `Slug: ${verifiedHome.slug}`
    );

    console.log(
      `Title: ${verifiedHome.title}`
    );

    console.log(
      `Sections: ${
        Object.keys(
          verifiedHome.sections || {}
        ).join(", ")
      }`
    );

    console.log("\n✅ Nothing else was modified.");

    process.exit(0);

  } catch (error) {

    console.error(
      "\n❌ HOME RESTORE FAILED"
    );

    console.error(error);

    process.exit(1);
  }
};

restoreHome();