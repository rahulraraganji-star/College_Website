import { PERMISSIONS } from "../constants/permissions.js";
import { SCOPES } from "../constants/scopes.js";


/* ==========================================
   SUPER ADMIN CHECK
========================================== */

export const isSuperAdmin = (user) => {
  return user?.role === "super_admin";
};


/* ==========================================
   ADMIN CHECK
========================================== */

export const isAdmin = (user) => {
  return user?.role === "admin";
};


/* ==========================================
   PERMISSION CHECK
========================================== */

export const hasPermission = (
  role,
  permission
) => {

  if (!role || !permission) {
    return false;
  }

  const permissions =
    Array.isArray(role.permissions)
      ? role.permissions
      : [];

  /* Super wildcard */

  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(permission);
};


/* ==========================================
   SCOPE CHECK
========================================== */

export const hasScope = (
  role,
  scope
) => {

  if (!role || !scope) {
    return false;
  }

  const allowedPages =
    Array.isArray(role.allowedPages)
      ? role.allowedPages
      : [];

  /* Wildcard scope */

  if (allowedPages.includes("*")) {
    return true;
  }

  return allowedPages.includes(scope);
};


/* ==========================================
   CAN GRANT PERMISSION
========================================== */

export const canGrantPermission = (
  actorRole,
  permission
) => {

  if (!actorRole || !permission) {
    return false;
  }

  /* Super Admin can grant everything */

  if (
    actorRole.systemRole === "super_admin"
  ) {
    return true;
  }

  /*
   * Admin/custom roles can only grant
   * permissions they themselves possess.
   */

  return hasPermission(
    actorRole,
    permission
  );
};


/* ==========================================
   CAN GRANT SCOPE
========================================== */

export const canGrantScope = (
  actorRole,
  scope
) => {

  if (!actorRole || !scope) {
    return false;
  }

  /* Super Admin can grant everything */

  if (
    actorRole.systemRole === "super_admin"
  ) {
    return true;
  }

  /*
   * Role with wildcard can grant
   * any scope.
   */

  if (
    Array.isArray(actorRole.allowedPages) &&
    actorRole.allowedPages.includes("*")
  ) {
    return true;
  }

  return hasScope(
    actorRole,
    scope
  );
};


/* ==========================================
   CAN MANAGE TARGET ROLE
========================================== */

export const canManageRole = (
  actor,
  actorRole,
  targetRole
) => {

  if (
    !actor ||
    !actorRole ||
    !targetRole
  ) {
    return false;
  }


  /* ------------------------------------------
     SUPER ADMIN
  ------------------------------------------ */

  if (
    actorRole.systemRole === "super_admin"
  ) {
    return true;
  }


  /* ------------------------------------------
     PROTECT SYSTEM ROLES
  ------------------------------------------ */

  if (targetRole.isSystemRole) {
    return false;
  }


  /* ------------------------------------------
     ADMIN
  ------------------------------------------ */

  if (
    actorRole.systemRole === "admin"
  ) {
    return true;
  }


  /* ------------------------------------------
     CUSTOM ROLE
  ------------------------------------------ */

  return false;
};


/* ==========================================
   CAN CREATE ROLE
========================================== */

export const canCreateRole = (
  actorRole
) => {

  if (!actorRole) {
    return false;
  }

  /* Super Admin */

  if (
    actorRole.systemRole === "super_admin"
  ) {
    return true;
  }

  /* Admin */

  if (
    actorRole.systemRole === "admin"
  ) {
    return true;
  }

  /* Custom role */

  return hasPermission(
    actorRole,
    PERMISSIONS.ROLES_CREATE
  );
};


/* ==========================================
   VALIDATE GRANTED PERMISSIONS
========================================== */

export const validateGrantedPermissions = (
  actorRole,
  permissions
) => {

  if (!Array.isArray(permissions)) {
    return {
      valid: false,
      invalidPermissions: [],
      message:
        "Permissions must be an array.",
    };
  }


  const invalidPermissions =
    permissions.filter(
      (permission) =>
        !canGrantPermission(
          actorRole,
          permission
        )
    );


  return {
    valid:
      invalidPermissions.length === 0,

    invalidPermissions,
  };
};


/* ==========================================
   VALIDATE GRANTED SCOPES
========================================== */

export const validateGrantedScopes = (
  actorRole,
  scopes
) => {

  if (!Array.isArray(scopes)) {
    return {
      valid: false,
      invalidScopes: [],
      message:
        "Allowed pages must be an array.",
    };
  }


  const invalidScopes =
    scopes.filter(
      (scope) =>
        !canGrantScope(
          actorRole,
          scope
        )
    );

  return {
    valid:
      invalidScopes.length === 0,

    invalidScopes,
  };
};