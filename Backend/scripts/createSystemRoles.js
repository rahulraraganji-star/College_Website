import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../database/connect.js";
import Role from "../models/Role.js";

dotenv.config();

const createSystemRoles = async () => {
  try {
    await connectDB();

    /* ==========================================
       SUPER ADMIN
    ========================================== */

    const superAdminRole = await Role.findOneAndUpdate(
      {
        slug: "super-admin",
      },
      {
        name: "Super Admin",
        slug: "super-admin",
        description: "Full system access.",
        isSystemRole: true,
        systemRole: "super_admin",
        permissions: ["*"],
        allowedPages: ["*"],
        isActive: true,
        createdBy: null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    /* ==========================================
       ADMIN
    ========================================== */

    const adminRole = await Role.findOneAndUpdate(
      {
        slug: "admin",
      },
      {
        name: "Admin",
        slug: "admin",
        description: "College CMS administrator.",
        isSystemRole: true,
        systemRole: "admin",
        permissions: ["*"],
        allowedPages: ["*"],
        isActive: true,
        createdBy: null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("✅ System roles created/updated.");

    console.log(
      `Super Admin Role: ${superAdminRole._id}`
    );

    console.log(
      `Admin Role: ${adminRole._id}`
    );

    process.exit(0);

  } catch (error) {
    console.error(
      "❌ Failed to create system roles."
    );

    console.error(error);

    process.exit(1);
  }
};

createSystemRoles();