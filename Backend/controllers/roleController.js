import Role from "../models/Role.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { SCOPES } from "../constants/scopes.js";
import User from "../models/User.js";

import {
  canCreateRole,
  canManageRole,
  validateGrantedPermissions,
  validateGrantedScopes,
} from "../utils/authorization.js";

/* ==========================================
   GET ALL ROLES
========================================== */

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      isActive: true,
    })
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        isSystemRole: -1,
        name: 1,
      });

    return res.json({
      success: true,
      roles,
    });

  } catch (error) {
    console.error(
      "GET ROLES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
    });
  }
};


/* ==========================================
   GET SINGLE ROLE
========================================== */

export const getRoleById = async (
  req,
  res
) => {
  try {
    const role = await Role.findById(
      req.params.id
    ).populate(
      "createdBy",
      "name email role"
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    return res.json({
      success: true,
      role,
    });

  } catch (error) {
    console.error(
      "GET ROLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch role.",
    });
  }
};


/*create Role*/

export const createRole = async (req, res) => {
  try {

    const {
      name,
      slug,
      description,
      permissions = [],
      allowedPages = [],
    } = req.body;


    /* ------------------------------------------
       LOAD ACTOR ROLE
    ------------------------------------------ */

    const actorRole = req.authRole;

    if (!actorRole) {
      return res.status(403).json({
        success: false,
        message:
          "No role has been assigned to this account.",
      });
    }


    /* ------------------------------------------
       CAN CREATE ROLE
    ------------------------------------------ */

    if (!canCreateRole(actorRole)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to create roles.",
      });
    }


    /* ------------------------------------------
       BASIC VALIDATION
    ------------------------------------------ */

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Role name is required.",
      });
    }

    if (!slug?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Role slug is required.",
      });
    }


    /* ------------------------------------------
       CUSTOM ROLE ONLY
    ------------------------------------------ */

    const normalizedSlug =
      slug.toLowerCase().trim();


    if (
      normalizedSlug === "super-admin" ||
      normalizedSlug === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "System role slugs are reserved.",
      });
    }


    /* ------------------------------------------
       VALIDATE PERMISSIONS
    ------------------------------------------ */

    const permissionValidation =
      validateGrantedPermissions(
        actorRole,
        permissions
      );

    if (!permissionValidation.valid) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot grant one or more of these permissions.",
        invalidPermissions:
          permissionValidation.invalidPermissions,
      });
    }


    /* ------------------------------------------
       VALIDATE PAGE SCOPES
    ------------------------------------------ */

    const scopeValidation =
      validateGrantedScopes(
        actorRole,
        allowedPages
      );

    if (!scopeValidation.valid) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot grant one or more of these page scopes.",
        invalidScopes:
          scopeValidation.invalidScopes,
      });
    }


    /* ------------------------------------------
       DUPLICATE SLUG
    ------------------------------------------ */

    const existingRole =
      await Role.findOne({
        slug: normalizedSlug,
      });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message:
          "A role with this slug already exists.",
      });
    }


    /* ------------------------------------------
       CREATE CUSTOM ROLE
    ------------------------------------------ */

    const role =
      await Role.create({

        name: name.trim(),

        slug: normalizedSlug,

        description:
          description?.trim() || "",

        isSystemRole: false,

        systemRole: null,

        permissions,

        allowedPages,

        isActive: true,

        createdBy:
          req.authUser._id,
      });


    return res.status(201).json({
      success: true,
      message:
        "Role created successfully.",
      role,
    });

  } catch (error) {

    console.error(
      "CREATE ROLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create role.",
    });
  }
};


/* ==========================================
   UPDATE ROLE
========================================== */

export const updateRole = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      name,
      slug,
      description,
      permissions,
      allowedPages,
      isActive,
    } = req.body;


    /* ------------------------------------------
       ACTOR ROLE
    ------------------------------------------ */

    const actorRole =
      req.authRole;

    if (!actorRole) {
      return res.status(403).json({
        success: false,
        message:
          "No role has been assigned to this account.",
      });
    }


    /* ------------------------------------------
       FIND TARGET ROLE
    ------------------------------------------ */

    const role =
      await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message:
          "Role not found.",
      });
    }


    /* ------------------------------------------
       CAN MANAGE TARGET ROLE
    ------------------------------------------ */

    if (
      !canManageRole(
        req.authUser,
        actorRole,
        role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to modify this role.",
      });
    }


    /* ------------------------------------------
       SYSTEM ROLE PROTECTION
    ------------------------------------------ */

   /* ------------------------------------------
   SYSTEM ROLE PROTECTION
------------------------------------------ */

if (role.isSystemRole) {

  // Super Admin role can NEVER be modified
  if (role.systemRole === "super_admin") {
    return res.status(403).json({
      success: false,
      message:
        "Super Admin role cannot be modified.",
    });
  }

  // Only Super Admin can modify Admin role
  if (
    role.systemRole === "admin" &&
    actorRole.systemRole !== "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Only Super Admin can modify the Admin role.",
    });
  }

  // Reject unknown system roles
  if (
    role.systemRole !== "admin" &&
    role.systemRole !== "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "This system role cannot be modified.",
    });
  }
}

    /* ------------------------------------------
       VALIDATE PERMISSIONS
    ------------------------------------------ */

    if (permissions !== undefined) {

      const permissionValidation =
        validateGrantedPermissions(
          actorRole,
          permissions
        );

      if (!permissionValidation.valid) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot grant one or more of these permissions.",
          invalidPermissions:
            permissionValidation.invalidPermissions,
        });
      }

      role.permissions =
        permissions;
    }


    /* ------------------------------------------
       VALIDATE PAGE SCOPES
    ------------------------------------------ */

    if (allowedPages !== undefined) {

      const scopeValidation =
        validateGrantedScopes(
          actorRole,
          allowedPages
        );

      if (!scopeValidation.valid) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot grant one or more of these page scopes.",
          invalidScopes:
            scopeValidation.invalidScopes,
        });
      }

      role.allowedPages =
        allowedPages;
    }


    /* ------------------------------------------
       BASIC INFORMATION
    ------------------------------------------ */

    if (name !== undefined) {

      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Role name cannot be empty.",
        });
      }

      role.name =
        name.trim();
    }


    if (description !== undefined) {

      role.description =
        description?.trim() || "";
    }


    /* ------------------------------------------
       SLUG
    ------------------------------------------ */

    if (slug !== undefined) {

      const normalizedSlug =
        slug.toLowerCase().trim();

      if (!normalizedSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Role slug cannot be empty.",
        });
      }


      if (
        normalizedSlug === "super-admin" ||
        normalizedSlug === "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "System role slugs are reserved.",
        });
      }


      if (
        normalizedSlug !== role.slug
      ) {

        const existingRole =
          await Role.findOne({
            slug: normalizedSlug,
            _id: {
              $ne: role._id,
            },
          });

        if (existingRole) {
          return res.status(409).json({
            success: false,
            message:
              "A role with this slug already exists.",
          });
        }
      }


      role.slug =
        normalizedSlug;
    }


    /* ------------------------------------------
       ACTIVE STATUS
    ------------------------------------------ */

    if (isActive !== undefined) {

      role.isActive =
        Boolean(isActive);
    }


    /* ------------------------------------------
       SAVE
    ------------------------------------------ */

    await role.save();


    return res.json({
      success: true,
      message:
        "Role updated successfully.",
      role,
    });

  } catch (error) {

    console.error(
      "UPDATE ROLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update role.",
    });
  }
};


/* ==========================================
   DELETE ROLE
========================================== */
export const deleteRole = async (req, res) => {
  try {

    const { id } =
      req.params;


    /* ------------------------------------------
       ACTOR ROLE
    ------------------------------------------ */

    const actorRole =
      req.authRole;

    if (!actorRole) {
      return res.status(403).json({
        success: false,
        message:
          "No role has been assigned to this account.",
      });
    }


    /* ------------------------------------------
       FIND ROLE
    ------------------------------------------ */

    const role =
      await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message:
          "Role not found.",
      });
    }


    /* ------------------------------------------
       CAN MANAGE TARGET
    ------------------------------------------ */

    if (
      !canManageRole(
        req.authUser,
        actorRole,
        role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this role.",
      });
    }


    /* ------------------------------------------
       SYSTEM ROLE PROTECTION
    ------------------------------------------ */

    if (role.isSystemRole) {
      return res.status(403).json({
        success: false,
        message:
          "System roles cannot be deleted.",
      });
    }


    /* ------------------------------------------
       USERS USING ROLE
    ------------------------------------------ */

    const usersUsingRole =
      await User.countDocuments({
        roleId: role._id,
      });

    if (usersUsingRole > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This role cannot be deleted because users are assigned to it.",
        usersUsingRole,
      });
    }


    /* ------------------------------------------
       SOFT DELETE
    ------------------------------------------ */

    role.isActive =
      false;

    await role.save();


    return res.json({
      success: true,
      message:
        "Role deleted successfully.",
    });

  } catch (error) {

    console.error(
      "DELETE ROLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete role.",
    });
  }
};