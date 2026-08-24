import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { createAuditLog } from "../services/auditService.js";


/* ==========================================
   SYSTEM ROLE PROTECTION HELPER
   Returns true if the user is a protected
   system account (super_admin or admin with
   isSystemRole flag). Only a super_admin
   can act on another admin account.
========================================== */

const isProtectedSystemUser = (user) => {
  return (
    user.role === "super_admin" ||
    (user.role === "admin" && user.isSystemRole)
  );
};

const actorCanManageTarget = (actor, target) => {
  // Super admin can manage anyone
  if (actor.role === "super_admin") {
    return true;
  }

  // Admin cannot touch super admin or other protected admins
  if (isProtectedSystemUser(target)) {
    return false;
  }

  // Department editors cannot manage other users at all
  // (permission middleware already handles this, but belt+suspenders)
  if (actor.role === "department_editor") {
    return false;
  }

  return true;
};


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
      // Legacy direct-permission support (kept for
      // dashboard overlay which still uses direct access)
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
       PASSWORD HASH
    ------------------------------------------ */

    const passwordHash = await bcrypt.hash(password, 12);


    /* ------------------------------------------
       RESOLVE ROLE PERMISSIONS
       If a roleId is supplied, copy the role's
       permissions and allowedPages to the user
       so middleware can read them directly.
    ------------------------------------------ */

    let resolvedPermissions = permissions;
    let resolvedAllowedPages = allowedPages;
    let resolvedRole = "department_editor";

    if (roleId) {
      const role = await Role.findById(roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Assigned role not found.",
        });
      }

      resolvedPermissions = role.permissions || [];
      resolvedAllowedPages = role.allowedPages || [];

      if (role.isSystemRole) {
        resolvedRole = role.systemRole;
      }
    }


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
      createdBy: req.authUser?._id || null,
    });


    /* ------------------------------------------
       AUDIT LOG
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


    /* ------------------------------------------
       BUILD FILTER QUERY
    ------------------------------------------ */

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


    /* ------------------------------------------
       PAGINATION
    ------------------------------------------ */

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


    /* ------------------------------------------
       FIND TARGET USER
    ------------------------------------------ */

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
        message: "You are not allowed to edit this user.",
      });
    }


    /* ------------------------------------------
       CAPTURE BEFORE STATE
    ------------------------------------------ */

    const before = {
      name: user.name,
      email: user.email,
      department: user.department,
      status: user.status,
      roleId: user.roleId,
    };


    /* ------------------------------------------
       UPDATE FIELDS
    ------------------------------------------ */

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
      user.status = status;
    }


    /* ------------------------------------------
       ROLE CHANGE — copy permissions to user
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

        user.roleId = roleId;
        user.permissions = role.permissions || [];
        user.allowedPages = role.allowedPages || [];

        if (role.isSystemRole) {
          user.role = role.systemRole;
        } else {
          user.role = "department_editor";
        }
      } else {
        // Clearing role
        user.roleId = null;
      }
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


    /* ------------------------------------------
       CANNOT DELETE SELF
    ------------------------------------------ */

    if (userId === req.authUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }


    /* ------------------------------------------
       FIND TARGET USER
    ------------------------------------------ */

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
        message: "You are not allowed to delete this user.",
      });
    }


    /* ------------------------------------------
       SOFT DELETE
    ------------------------------------------ */

    user.status = "deleted";
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
        message: "You are not allowed to modify this user's role.",
      });
    }

    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }


    /* ------------------------------------------
       CAPTURE BEFORE STATE
    ------------------------------------------ */

    const before = {
      roleId: user.roleId,
      role: user.role,
    };


    /* ------------------------------------------
       ASSIGN ROLE + COPY PERMISSIONS
    ------------------------------------------ */

    user.roleId = roleId;

    if (role.isSystemRole) {
      user.role = role.systemRole;
    } else {
      user.role = "department_editor";
    }

    user.permissions = role.permissions || [];
    user.allowedPages = role.allowedPages || [];

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