import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { createAuditLog } from "../services/auditService.js";
import {
  actorCanManageTarget,
  actorCanAssignRole,
  validateGrantedPermissions,
  validateGrantedScopes,
} from "../utils/authorization.js";

/* ==========================================
   CREATE USER
========================================== */

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      status = "active",
      roleId,
      permissions = [],
      allowedPages = [],
      contentAccess = [],
    } = req.body;

    /* ------------------------------------------
       BASIC VALIDATION
    ------------------------------------------ */

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    /* ------------------------------------------
       CHECK DUPLICATE EMAIL
    ------------------------------------------ */

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    /* ------------------------------------------
       RESOLVE ROLE & VALIDATE DELEGATION BOUNDARY
    ------------------------------------------ */

    let resolvedPermissions = [];
    let resolvedAllowedPages = [];
    let resolvedRole = "department_editor";

    if (roleId) {
      const role = await Role.findById(roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Assigned role not found.",
        });
      }

      // Verify the actor has authority to assign this role
      if (!actorCanAssignRole(req.authUser, role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to assign this role.",
        });
      }

      resolvedPermissions = role.permissions || [];
      resolvedAllowedPages = role.allowedPages || [];

      if (role.isSystemRole) {
        resolvedRole = role.systemRole;
      }
    } else {
      // Direct permissions validation if no roleId
      if (permissions.length > 0) {
        const permValidation = validateGrantedPermissions(req.authRole, permissions);
        if (!permValidation.valid) {
          return res.status(403).json({
            success: false,
            message: "You cannot grant one or more of these permissions.",
            invalidPermissions: permValidation.invalidPermissions,
          });
        }
        resolvedPermissions = permissions;
      }

      if (allowedPages.length > 0) {
        const scopeValidation = validateGrantedScopes(req.authRole, allowedPages);
        if (!scopeValidation.valid) {
          return res.status(403).json({
            success: false,
            message: "You cannot grant one or more of these page scopes.",
            invalidScopes: scopeValidation.invalidScopes,
          });
        }
        resolvedAllowedPages = allowedPages;
      }
    }

    // Protection check: Non-super_admin cannot create super_admin or admin
    if (
      (resolvedRole === "super_admin" || resolvedRole === "admin") &&
      req.authUser.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create system administrator accounts.",
      });
    }

    /* ------------------------------------------
       PASSWORD HASH
    ------------------------------------------ */

    const passwordHash = await bcrypt.hash(password, 12);

    /* ------------------------------------------
       CREATE USER
    ------------------------------------------ */

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: resolvedRole,
      roleId: roleId || null,
      department: department?.trim() || null,
      permissions: resolvedPermissions,
      allowedPages: resolvedAllowedPages,
      contentAccess,
      status,
      emailVerified: false,
      tokenVersion: 0,
      createdBy: req.authUser?._id || null,
    });

    /* ------------------------------------------
       AUDIT LOG (never log plaintext passwords)
    ------------------------------------------ */

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "USER_CREATED",
      before: null,
      after: {
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        status: user.status,
      },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    /* ------------------------------------------
       RETURN SAFE USER
    ------------------------------------------ */

    const createdUser = await User.findById(user._id)
      .select("-passwordHash")
      .populate("roleId", "name description isSystemRole systemRole");

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: createdUser,
    });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }
};

/* ==========================================
   GET ALL USERS
========================================== */

export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      q = "",
      role = "",
      status = "",
    } = req.query;

    const filter = {};

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (role.trim()) {
      filter.role = role.trim();
    }

    if (status.trim()) {
      filter.status = status.trim();
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .populate("roleId", "name description isSystemRole systemRole")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

/* ==========================================
   GET SINGLE USER
========================================== */

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate("roleId", "name description isSystemRole systemRole permissions allowedPages");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
    });
  }
};

/* ==========================================
   UPDATE USER
========================================== */

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      department,
      status,
      roleId,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* ------------------------------------------
       HIERARCHY & PROTECTION CHECK
    ------------------------------------------ */

    if (!actorCanManageTarget(req.authUser, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this user.",
      });
    }

    const before = {
      name: user.name,
      email: user.email,
      department: user.department,
      status: user.status,
      roleId: user.roleId,
      role: user.role,
    };

    if (name) user.name = name.trim();

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicate = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another user with this email already exists.",
        });
      }

      user.email = normalizedEmail;
    }

    if (department !== undefined) {
      user.department = department?.trim() || null;
    }

    if (status) {
      // If status changed to non-active, invalidate active sessions
      if (status !== user.status && status !== "active") {
        user.tokenVersion = (user.tokenVersion || 0) + 1;
      }
      user.status = status;
    }

    /* ------------------------------------------
       ROLE CHANGE & DELEGATION CHECK
    ------------------------------------------ */

    if (roleId !== undefined) {
      if (roleId) {
        const role = await Role.findById(roleId);

        if (!role) {
          return res.status(404).json({
            success: false,
            message: "Assigned role not found.",
          });
        }

        if (!actorCanAssignRole(req.authUser, role)) {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to assign this role.",
          });
        }

        user.roleId = roleId;
        user.permissions = role.permissions || [];
        user.allowedPages = role.allowedPages || [];

        if (role.isSystemRole) {
          user.role = role.systemRole;
        } else {
          user.role = "department_editor";
        }
      } else {
        // Clearing role — only allowed if not demoting super_admin without authorization
        if (user.role === "super_admin" && req.authUser.role !== "super_admin") {
          return res.status(403).json({
            success: false,
            message: "Super Admin role cannot be removed.",
          });
        }
        user.roleId = null;
      }

      // Invalidate active session tokens when role changes
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    /* ------------------------------------------
       AUDIT LOG
    ------------------------------------------ */

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "USER_UPDATED",
      before,
      after: {
        name: user.name,
        email: user.email,
        department: user.department,
        status: user.status,
        roleId: user.roleId,
        role: user.role,
      },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    const updatedUser = await User.findById(userId)
      .select("-passwordHash")
      .populate("roleId", "name description isSystemRole systemRole");

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

/* ==========================================
   DELETE USER (SOFT DELETE)
========================================== */

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.authUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* ------------------------------------------
       SUPER ADMIN CANNOT BE DELETED
    ------------------------------------------ */

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin accounts cannot be deleted.",
      });
    }

    /* ------------------------------------------
       PROTECTION CHECK
    ------------------------------------------ */

    if (!actorCanManageTarget(req.authUser, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this user.",
      });
    }

    user.status = "deleted";
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "USER_DELETED",
      before: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: "active",
      },
      after: { status: "deleted" },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully.",
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

/* ==========================================
   ASSIGN ROLE TO USER
========================================== */

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* ------------------------------------------
       PROTECTION CHECK
    ------------------------------------------ */

    if (!actorCanManageTarget(req.authUser, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this user's role.",
      });
    }

    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    if (!actorCanAssignRole(req.authUser, role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to assign this role.",
      });
    }

    const before = {
      roleId: user.roleId,
      role: user.role,
    };

    user.roleId = roleId;

    if (role.isSystemRole) {
      user.role = role.systemRole;
    } else {
      user.role = "department_editor";
    }

    user.permissions = role.permissions || [];
    user.allowedPages = role.allowedPages || [];
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "ROLE_ASSIGNED",
      before,
      after: {
        roleId: user.roleId,
        role: user.role,
        roleName: role.name,
      },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    const updatedUser = await User.findById(userId)
      .select("-passwordHash")
      .populate("roleId", "name description isSystemRole systemRole");

    return res.status(200).json({
      success: true,
      message: "Role assigned successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error("ASSIGN ROLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign role.",
    });
  }
};

/* ==========================================
   RESET USER PASSWORD (ADMIN / SUPER ADMIN)
========================================== */

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* ------------------------------------------
       HIERARCHY CHECK
       - Super Admin can reset anyone's password.
       - Admin can reset custom role users.
       - Admin CANNOT reset Super Admin or other Admins.
    ------------------------------------------ */

    if (!actorCanManageTarget(req.authUser, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reset this user's password.",
      });
    }

    // Generate secure temporary password if not provided
    const generatedPassword = newPassword && newPassword.length >= 8
      ? newPassword
      : `College@${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const passwordHash = await bcrypt.hash(generatedPassword, 12);
    user.passwordHash = passwordHash;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all active sessions

    await user.save();

    /* ------------------------------------------
       AUDIT LOG (Never log passwords)
    ------------------------------------------ */

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      action: "PASSWORD_RESET",
      before: null,
      after: { passwordReset: true },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      temporaryPassword: generatedPassword,
    });

  } catch (error) {
    console.error("RESET USER PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};