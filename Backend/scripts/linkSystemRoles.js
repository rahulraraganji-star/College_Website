import dotenv from "dotenv";

import connectDB from "../database/connect.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const linkSystemRoles = async () => {
  try {
    await connectDB();

    /* ==========================================
       FIND SYSTEM ROLES
    ========================================== */

    const superAdminRole = await Role.findOne({
      systemRole: "super_admin",
      isSystemRole: true,
    });

    const adminRole = await Role.findOne({
      systemRole: "admin",
      isSystemRole: true,
    });

    if (!superAdminRole) {
      throw new Error(
        "Super Admin role was not found."
      );
    }

    if (!adminRole) {
      throw new Error(
        "Admin role was not found."
      );
    }


    /* ==========================================
       LINK SUPER ADMINS
    ========================================== */

    const superAdminResult =
      await User.updateMany(
        {
          role: "super_admin",
        },
        {
          $set: {
            roleId: superAdminRole._id,
          },
        }
      );


    /* ==========================================
       LINK ADMINS
    ========================================== */

    const adminResult =
      await User.updateMany(
        {
          role: "admin",
        },
        {
          $set: {
            roleId: adminRole._id,
          },
        }
      );


    /* ==========================================
       RESULT
    ========================================== */

    console.log(
      `✅ Linked ${superAdminResult.modifiedCount} Super Admin user(s).`
    );

    console.log(
      `✅ Linked ${adminResult.modifiedCount} Admin user(s).`
    );

    process.exit(0);

  } catch (error) {
    console.error(
      "❌ Failed to link system roles."
    );

    console.error(error);

    process.exit(1);
  }
};

linkSystemRoles();