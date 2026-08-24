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
       
       We compute once here so every middleware
       downstream can read req.authUser.permissions
       without re-querying.
    ========================================== */

    let effectivePermissions;
    let effectiveAllowedPages;

    if (user.role === "super_admin") {
      // Super admin has unrestricted access
      effectivePermissions = ["*"];
      effectiveAllowedPages = ["*"];

    } else {
      // For admin and dept_editor:
      // Use user's own permissions (copied from role at
      // create/update time). Fall back to role permissions
      // for legacy accounts that were created before
      // the copy-on-assign pattern was introduced.
      const userPerms = user.permissions || [];
      const rolePerms = user.roleId?.permissions || [];

      effectivePermissions =
        userPerms.length > 0 ? userPerms : rolePerms;

      const userPages = user.allowedPages || [];
      const rolePages = user.roleId?.allowedPages || [];

      effectiveAllowedPages =
        userPages.length > 0 ? userPages : rolePages;
    }

    // Attach everything to req for downstream middleware
    req.user = decoded;

    req.authUser = user;
    req.authUser.permissions = effectivePermissions;
    req.authUser.allowedPages = effectiveAllowedPages;

    // Super Admin has no roleId — synthesize a virtual role so
    // canGrantScope/canGrantPermission/canCreateRole helpers work correctly.
    if (user.role === "super_admin") {
      req.authRole = {
        systemRole: "super_admin",
        isSystemRole: true,
        permissions: ["*"],
        allowedPages: ["*"],
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