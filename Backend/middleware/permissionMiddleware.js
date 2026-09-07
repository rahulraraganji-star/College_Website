/* ==========================================
   REQUIRE PERMISSION
   
   Reads from req.authUser.permissions which
   is set by authMiddleware. Does NOT re-query
   the DB or require a roleId.
   
   Super Admin (permissions === ["*"]) bypasses
   every check automatically.
   
   Hierarchy support: edit/create/delete/upload
   implies view for the corresponding module.
========================================== */

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      /* ------------------------------------------
         MUST HAVE AUTH CONTEXT FROM requireAuth
      ------------------------------------------ */

      if (!req.authUser) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /* ------------------------------------------
         ACCOUNT STATUS
      ------------------------------------------ */

      if (req.authUser.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Your account is not active.",
        });
      }

      /* ------------------------------------------
         SUPER ADMIN / WILDCARD BYPASS
      ------------------------------------------ */

      const permissions =
        Array.isArray(req.authUser.permissions)
          ? req.authUser.permissions
          : [];

      if (
        req.authUser.role === "super_admin" ||
        permissions.includes("*")
      ) {
        return next();
      }

      /* ------------------------------------------
         VALIDATE PERMISSION NAME
      ------------------------------------------ */

      if (!permission) {
        return res.status(500).json({
          success: false,
          message: "Permission middleware is misconfigured.",
        });
      }

      /* ------------------------------------------
         CHECK SPECIFIC PERMISSION (WITH HIERARCHY)
      ------------------------------------------ */

      let hasPerm = permissions.includes(permission);

      if (!hasPerm && permission.endsWith(".view")) {
        const modulePrefix = permission.split(".")[0] + ".";
        hasPerm = permissions.some((p) => p.startsWith(modulePrefix));
      }

      if (!hasPerm) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
          requiredPermission: permission,
        });
      }

      next();

    } catch (error) {
      console.error(
        "PERMISSION MIDDLEWARE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Authorization check failed.",
      });
    }
  };
};

/* ==========================================
   REQUIRE ANY PERMISSION
========================================== */

export const requireAnyPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (req.authUser.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Your account is not active.",
        });
      }

      const permissions =
        Array.isArray(req.authUser.permissions)
          ? req.authUser.permissions
          : [];

      if (
        req.authUser.role === "super_admin" ||
        permissions.includes("*")
      ) {
        return next();
      }

      const hasAny = requiredPermissions.some((permission) => {
        if (permissions.includes(permission)) return true;
        if (permission.endsWith(".view")) {
          const modulePrefix = permission.split(".")[0] + ".";
          return permissions.some((p) => p.startsWith(modulePrefix));
        }
        return false;
      });

      if (!hasAny) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          requiredPermissions,
        });
      }

      next();

    } catch (error) {
      console.error(
        "PERMISSION MIDDLEWARE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Authorization check failed.",
      });
    }
  };
};

/* ==========================================
   REQUIRE SYSTEM ROLE
========================================== */

export const requireSystemRole = (...roles) => {
  return (req, res, next) => {
    if (!req.authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have the required system role.",
        requiredRoles: roles,
      });
    }

    next();
  };
};