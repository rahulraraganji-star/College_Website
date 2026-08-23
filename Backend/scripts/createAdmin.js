import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const createAdmin = async () => {
  try {
    /* ==========================================
       CONNECT TO MONGODB
    ========================================== */

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");


    /* ==========================================
       FIND ADMIN SYSTEM ROLE
    ========================================== */

    const adminRole = await Role.findOne({
      systemRole: "admin",
      isSystemRole: true,
      isActive: true,
    });

    if (!adminRole) {
      throw new Error(
        "Admin system role not found."
      );
    }

    console.log(
      "Admin role found:",
      adminRole._id.toString()
    );


    /* ==========================================
       ADMIN ACCOUNT DETAILS
    ========================================== */

    const email = "admin@example.com";
    const password = "Admin@12345";


    /* ==========================================
       CHECK EXISTING USER
    ========================================== */

    let user = await User.findOne({
      email,
    });


    /* ==========================================
       PASSWORD HASH
    ========================================== */

    const passwordHash =
      await bcrypt.hash(password, 12);


    /* ==========================================
       CREATE OR UPDATE ADMIN
    ========================================== */

    if (user) {

      console.log(
        "Admin user already exists. Updating..."
      );

      user.name = "College CMS Admin";
      user.passwordHash = passwordHash;
      user.role = "admin";
      user.roleId = adminRole._id;
      user.department = null;
      user.status = "active";
      user.emailVerified = true;

      await user.save();

    } else {

      user = await User.create({
        name: "College CMS Admin",
        email,
        passwordHash,

        role: "admin",

        roleId: adminRole._id,

        department: null,

        status: "active",

        emailVerified: true,

        permissions: [],

        createdBy: null,

        lastLoginAt: null,
      });

    }


    /* ==========================================
       RESULT
    ========================================== */

    console.log("");
    console.log("==========================================");
    console.log("ADMIN USER READY");
    console.log("==========================================");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log(
      "Role ID:",
      user.roleId.toString()
    );
    console.log("Status:", user.status);
    console.log("==========================================");
    console.log("");
    console.log("Login credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("==========================================");


  } catch (error) {

    console.error(
      "CREATE ADMIN ERROR:",
      error
    );

  } finally {

    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed"
    );
  }
};


createAdmin();