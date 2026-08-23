import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../database/connect.js";
import User from "../models/User.js";

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: "library@example.com",
    });

    if (existingUser) {
      console.log("❌ Test user already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(
      "123456",
      12
    );

    const user = await User.create({
      name: "Library Staff",
      email: "library@example.com",
      passwordHash,

      role: "department_editor",

      roleId: null,

      department: "Library",

      status: "active",

      emailVerified: true,

      permissions: [],

      createdBy: null,

      lastLoginAt: null,
    });

    console.log(
      "✅ Test user created."
    );

    console.log(
      `User ID: ${user._id}`
    );

    console.log(
      `Email: ${user.email}`
    );

    process.exit(0);

  } catch (error) {
    console.error(
      "❌ Failed to create test user."
    );

    console.error(error);

    process.exit(1);
  }
};

createTestUser();