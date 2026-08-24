import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

// ==========================================
// CREATE AUTH TOKEN
// ==========================================

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// ==========================================
// LOGIN
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ------------------------------------------
    // Validate input
    // ------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ------------------------------------------
    // Check account status
    // ------------------------------------------

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    // ------------------------------------------
    // Check password
    // ------------------------------------------

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ------------------------------------------
    // Create JWT
    // ------------------------------------------

    const token = createToken(user);

    // ------------------------------------------
    // Update last login
    // ------------------------------------------

    user.lastLoginAt = new Date();
    await user.save();

    // ------------------------------------------
    // Set HTTP-only cookie
    // ------------------------------------------

    res.cookie("cms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==========================================
// LOGOUT
// ==========================================

export const logout = async (req, res) => {
  try {
    res.clearCookie("cms_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==========================================
// CURRENT USER
// ==========================================

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-passwordHash")
      .populate(
        "roleId",
        "name slug permissions allowedPages isSystemRole systemRole isActive"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // EFFECTIVE PERMISSIONS
    // ==========================================

    let effectivePermissions;
    let effectiveAllowedPages;

    if (user.role === "super_admin") {
      effectivePermissions = ["*"];
      effectiveAllowedPages = ["*"];

    } else {
      const userPerms   = user.permissions   || [];
      const rolePerms   = user.roleId?.permissions   || [];
      const userPages   = user.allowedPages   || [];
      const rolePages   = user.roleId?.allowedPages   || [];

      effectivePermissions  = userPerms.length  > 0 ? userPerms  : rolePerms;
      effectiveAllowedPages = userPages.length  > 0 ? userPages  : rolePages;
    }

    return res.status(200).json({
      success: true,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        role: user.role,
        department: user.department,

        status: user.status,
        emailVerified: user.emailVerified,

        roleId: user.roleId,

        permissions: effectivePermissions,
        allowedPages: effectiveAllowedPages,

        lastLoginAt: user.lastLoginAt,
      },
    });

  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};