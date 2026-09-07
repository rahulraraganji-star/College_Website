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

export const hasPermission = (role, permission) => {
  if (!role || !permission) {
    return false;
  }

  const permissions = Array.isArray(role.permissions) ? role.permissions : [];

  /* Super wildcard */
  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(permission);
};

/* ==========================================
   SCOPE CHECK
========================================== */

export const hasScope = (role, scope) => {
  if (!role || !scope) {
    return false;
  }

  const allowedPages = Array.isArray(role.allowedPages) ? role.allowedPages : [];

  /* Wildcard scope */
  if (allowedPages.includes("*")) {
    return true;
  }

  return allowedPages.includes(scope);
};

/* ==========================================
   CAN GRANT PERMISSION
========================================== */

export const canGrantPermission = (actorRole, permission) => {
  if (!actorRole || !permission) {
    return false;
  }

  /* Super Admin can grant everything */
  if (actorRole.systemRole === "super_admin" || actorRole.role === "super_admin") {
    return true;
  }

  /* Wildcard '*' cannot be granted by non-super-admin */
  if (permission === "*") {
    return false;
  }

  /*
   * Admin/custom roles can only grant
   * permissions they themselves possess.
   */
  return hasPermission(actorRole, permission);
};

/* ==========================================
   CAN GRANT SCOPE
========================================== */

export const canGrantScope = (actorRole, scope) => {
  if (!actorRole || !scope) {
    return false;
  }

  /* Super Admin can grant everything */
  if (actorRole.systemRole === "super_admin" || actorRole.role === "super_admin") {
    return true;
  }

  /* Wildcard '*' scope cannot be granted by non-super-admin */
  if (scope === "*") {
    return false;
  }

  /*
   * Role with wildcard can grant any specific scope.
   */
  if (
    Array.isArray(actorRole.allowedPages) &&
    actorRole.allowedPages.includes("*")
  ) {
    return true;
  }

  return hasScope(actorRole, scope);
};

/* ==========================================
   CAN MANAGE TARGET ROLE
========================================== */

export const canManageRole = (actor, actorRole, targetRole) => {
  if (!actor || !targetRole) {
    return false;
  }

  /* Super Admin can manage all roles */
  if (actor.role === "super_admin" || actorRole?.systemRole === "super_admin") {
    return true;
  }

  /* System roles (super_admin, admin) cannot be modified by Admins or custom users */
  if (targetRole.isSystemRole || targetRole.systemRole === "super_admin" || targetRole.systemRole === "admin") {
    return false;
  }

  /* Admin can manage custom roles */
  if (actor.role === "admin" || actorRole?.systemRole === "admin") {
    return true;
  }

  /* Custom roles cannot manage roles */
  return false;
};

/* ==========================================
   CAN CREATE ROLE
========================================== */

export const canCreateRole = (actor, actorRole) => {
  if (!actor) {
    return false;
  }

  /* Super Admin */
  if (actor.role === "super_admin" || actorRole?.systemRole === "super_admin") {
    return true;
  }

  /* Admin */
  if (actor.role === "admin" || actorRole?.systemRole === "admin") {
    return true;
  }

  /* Custom role with roles.create permission */
  return actorRole ? hasPermission(actorRole, PERMISSIONS.ROLES_CREATE) : false;
};

/* ==========================================
   ACTOR CAN MANAGE TARGET USER
   Enforces strict security hierarchy:
   - Super Admin can manage everyone.
   - Admin CANNOT manage Super Admin or other Admins.
   - Admin can only manage custom role users.
   - Custom users cannot manage other users.
========================================== */

export const actorCanManageTarget = (actor, targetUser) => {
  if (!actor || !targetUser) {
    return false;
  }

  /* Super admin can manage anyone */
  if (actor.role === "super_admin") {
    return true;
  }

  /* Target is Super Admin -> NO ONE except Super Admin can touch them */
  if (targetUser.role === "super_admin") {
    return false;
  }

  /* Target is Admin -> Only Super Admin can touch them */
  if (targetUser.role === "admin") {
    return false;
  }

  /* Department editors / custom users cannot manage users at all */
  if (actor.role !== "admin" && actor.role !== "super_admin") {
    return false;
  }

  /* Admin can manage custom role users (e.g. department_editor) */
  return true;
};

/* ==========================================
   ACTOR CAN ASSIGN ROLE TO A USER
========================================== */

export const actorCanAssignRole = (actor, roleDoc) => {
  if (!actor || !roleDoc) {
    return false;
  }

  /* Super Admin can assign any role */
  if (actor.role === "super_admin") {
    return true;
  }

  /* Admin CANNOT assign Super Admin or Admin system roles */
  if (
    roleDoc.isSystemRole ||
    roleDoc.systemRole === "super_admin" ||
    roleDoc.systemRole === "admin" ||
    roleDoc.slug === "super-admin" ||
    roleDoc.slug === "admin"
  ) {
    return false;
  }

  /* Department editors / custom users cannot assign roles */
  if (actor.role !== "admin") {
    return false;
  }

  /* Role must be active */
  if (roleDoc.isActive === false) {
    return false;
  }

  return true;
};

/* ==========================================
   VALIDATE GRANTED PERMISSIONS
========================================== */

export const validateGrantedPermissions = (actorRole, permissions) => {
  if (!Array.isArray(permissions)) {
    return {
      valid: false,
      invalidPermissions: [],
      message: "Permissions must be an array.",
    };
  }

  /* If actor is super_admin, everything is valid */
  if (actorRole?.systemRole === "super_admin" || actorRole?.role === "super_admin") {
    return {
      valid: true,
      invalidPermissions: [],
    };
  }

  const invalidPermissions = permissions.filter(
    (permission) => !canGrantPermission(actorRole, permission)
  );

  return {
    valid: invalidPermissions.length === 0,
    invalidPermissions,
  };
};

/* ==========================================
   VALIDATE GRANTED SCOPES
========================================== */

export const validateGrantedScopes = (actorRole, scopes) => {
  if (!Array.isArray(scopes)) {
    return {
      valid: false,
      invalidScopes: [],
      message: "Allowed pages must be an array.",
    };
  }

  /* If actor is super_admin, everything is valid */
  if (actorRole?.systemRole === "super_admin" || actorRole?.role === "super_admin") {
    return {
      valid: true,
      invalidScopes: [],
    };
  }

  const invalidScopes = scopes.filter(
    (scope) => !canGrantScope(actorRole, scope)
  );

  return {
    valid: invalidScopes.length === 0,
    invalidScopes,
  };
};