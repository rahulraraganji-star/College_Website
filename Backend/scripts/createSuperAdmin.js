import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../database/connect.js";
import User from "../models/User.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    // Check whether a Super Admin already exists
    const existingSuperAdmin = await User.findOne({
      role: "super_admin",
    });

    if (existingSuperAdmin) {
      console.log("❌ Super Admin already exists.");
      process.exit(0);
    }

    // Get credentials from .env
    const name = process.env.SUPER_ADMIN_NAME;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.error(
        "❌ Missing SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env"
      );
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Super Admin
    const superAdmin = await User.create({
      name,
      email,
      passwordHash,

      role: "super_admin",

      department: null,

      status: "active",

      emailVerified: true,

      permissions: [],

      createdBy: null,

      lastLoginAt: null,
    });

    console.log("✅ Super Admin created successfully.");
    console.log(`Email: ${superAdmin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create Super Admin.");
    console.error(error);

    process.exit(1);
  }
};

createSuperAdmin();