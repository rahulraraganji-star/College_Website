import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { createAuditLog } from "../services/auditService.js";

// ==========================================
// CREATE AUTH TOKEN
// ==========================================

export const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
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

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
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

      effectivePermissions  = user.roleId ? (rolePerms.length > 0 ? rolePerms : userPerms) : userPerms;
      effectiveAllowedPages = user.roleId ? (rolePages.length > 0 ? rolePages : userPages) : userPages;
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

// ==========================================
// CHANGE OWN PASSWORD
// Authenticated user changes their own password
// ==========================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.authUser._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify current password
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    
    // Invalidate stale sessions by incrementing tokenVersion
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Issue new JWT token with updated tokenVersion
    const newToken = createToken(user);

    res.cookie("cms_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Create Audit Log (never recording passwords or hashes)
    await createAuditLog({
      req,
      actor: user,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "PASSWORD_CHANGED",
      before: null,
      after: { passwordChanged: true },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

// ==========================================
// UPDATE OWN EMAIL
// Authenticated user updates their email
// ==========================================

export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email format.",
      });
    }

    const user = await User.findById(req.authUser._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from current email.",
      });
    }

    // Check duplicate email across other users
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This email address is already in use by another account.",
      });
    }

    const oldEmail = user.email;
    user.email = normalizedEmail;
    await user.save();

    // Audit log
    await createAuditLog({
      req,
      actor: user,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "EMAIL_CHANGED",
      before: { email: oldEmail },
      after: { email: normalizedEmail },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    return res.status(200).json({
      success: true,
      message: "Email address updated successfully.",
      email: normalizedEmail,
    });

  } catch (error) {
    console.error("UPDATE EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update email.",
    });
  }
};