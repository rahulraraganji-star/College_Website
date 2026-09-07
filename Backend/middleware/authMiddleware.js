import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    /* ==========================================
       GET TOKEN
    ========================================== */

    const token = req.cookies.cms_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }


    /* ==========================================
       VERIFY TOKEN
    ========================================== */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    /* ==========================================
       LOAD USER + ROLE
    ========================================== */

    const user = await User.findById(
      decoded.userId
    ).populate(
      "roleId",
      "name slug permissions allowedPages isSystemRole systemRole isActive"
    );


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }


    /* ==========================================
       TOKEN VERSION / SESSION INVALIDATION CHECK
       If password was changed or sessions revoked,
       tokenVersion will have been incremented.
    ========================================== */

    const userTokenVersion = user.tokenVersion || 0;
    const decodedTokenVersion = decoded.tokenVersion ?? 0;

    if (decodedTokenVersion !== userTokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired or password was changed. Please log in again.",
      });
    }


    /* ==========================================
       ACCOUNT STATUS
    ========================================== */

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }


    /* ==========================================
       COMPUTE EFFECTIVE PERMISSIONS
       
       Rule:
         super_admin  → wildcard ["*"]
         admin        → user.permissions (set at
                        create/update time from role)
         dept_editor  → user.permissions (same)
    ========================================== */

    let effectivePermissions;
    let effectiveAllowedPages;

    if (user.role === "super_admin") {
      // Super admin has unrestricted access
      effectivePermissions = ["*"];
      effectiveAllowedPages = ["*"];

    } else {
      const userPerms = user.permissions || [];
      const rolePerms = user.roleId?.permissions || [];
      const userPages = user.allowedPages || [];
      const rolePages = user.roleId?.allowedPages || [];

      effectivePermissions =
        user.roleId ? (rolePerms.length > 0 ? rolePerms : userPerms) : userPerms;

      effectiveAllowedPages =
        user.roleId ? (rolePages.length > 0 ? rolePages : userPages) : userPages;
    }

    // Attach everything to req for downstream middleware
    req.user = decoded;

    req.authUser = user;
    req.authUser.permissions = effectivePermissions;
    req.authUser.allowedPages = effectiveAllowedPages;

    // Synthesize a virtual role for system roles if roleId is null
    if (user.role === "super_admin") {
      req.authRole = {
        name: "Super Admin",
        slug: "super-admin",
        systemRole: "super_admin",
        isSystemRole: true,
        permissions: ["*"],
        allowedPages: ["*"],
        role: "super_admin",
      };
    } else if (user.role === "admin" && !user.roleId) {
      req.authRole = {
        name: "Admin",
        slug: "admin",
        systemRole: "admin",
        isSystemRole: true,
        permissions: effectivePermissions,
        allowedPages: effectiveAllowedPages,
        role: "admin",
      };
    } else {
      req.authRole = user.roleId || null;
    }

    next();

  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication.",
    });
  }
};