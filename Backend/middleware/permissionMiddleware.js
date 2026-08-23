import User from "../models/User.js";
import Role from "../models/Role.js";

/* ==========================================
   REQUIRE PERMISSION
========================================== */

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      /* ------------------------------------------
         AUTHENTICATION CHECK
      ------------------------------------------ */

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /* ------------------------------------------
         VALIDATE PERMISSION NAME
      ------------------------------------------ */

      if (!permission) {
        return res.status(500).json({
          success: false,
          message:
            "Permission middleware is misconfigured.",
        });
      }

      /* ------------------------------------------
         LOAD USER + ROLE
      ------------------------------------------ */

      const user = await User.findById(
        req.user.userId
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

      /* ------------------------------------------
         ACCOUNT STATUS
      ------------------------------------------ */

      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Your account is not active.",
        });
      }

      /* ------------------------------------------
         ROLE CHECK
      ------------------------------------------ */

      const role = user.roleId;

      if (!role) {
        return res.status(403).json({
          success: false,
          message:
            "No role has been assigned to this account.",
        });
      }

      if (!role.isActive) {
        return res.status(403).json({
          success: false,
          message:
            "The assigned role is inactive.",
        });
      }

      /* ------------------------------------------
         SUPER ADMIN / WILDCARD
      ------------------------------------------ */

      const permissions =
        Array.isArray(role.permissions)
          ? role.permissions
          : [];

      const hasWildcard =
        permissions.includes("*");

      if (hasWildcard) {
        req.authUser = user;
        req.authRole = role;

        return next();
      }

      /* ------------------------------------------
         CHECK SPECIFIC PERMISSION
      ------------------------------------------ */

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
          requiredPermission: permission,
        });
      }

      /* ------------------------------------------
         ATTACH AUTHORIZATION CONTEXT
      ------------------------------------------ */

      req.authUser = user;
      req.authRole = role;

      next();

    } catch (error) {
      console.error(
        "PERMISSION MIDDLEWARE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Authorization check failed.",
      });
    }
  };
};