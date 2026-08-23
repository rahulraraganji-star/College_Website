import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";


// ==========================================
// CREATE USER — CUSTOM ACCESS
// ==========================================

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      status = "active",
      permissions = [],
      allowedPages = [],
      contentAccess = [],
    } = req.body;


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

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


    // ==========================================
    // VALIDATE ACCESS ARRAYS
    // ==========================================

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array.",
      });
    }

    if (!Array.isArray(allowedPages)) {
      return res.status(400).json({
        success: false,
        message: "allowedPages must be an array.",
      });
    }

    if (!Array.isArray(contentAccess)) {
      return res.status(400).json({
        success: false,
        message: "contentAccess must be an array.",
      });
    }


    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

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


    // ==========================================
    // PASSWORD HASH
    // ==========================================

    const passwordHash = await bcrypt.hash(password, 12);


    // ==========================================
    // CREATE USER
    // ==========================================

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "department_editor",
      roleId: null,
      department: department?.trim() || null,
      permissions,
      allowedPages,
      contentAccess,
      status,
      emailVerified: false,
      createdBy: req.user?.userId || null,
    });


    // ==========================================
    // RETURN SAFE USER
    // ==========================================

    const createdUser = await User.findById(user._id)
      .select("-passwordHash");


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


// ==========================================
// ASSIGN ROLE TO USER
// ==========================================

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

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

    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    // Update user with role
    user.roleId = roleId;

    // Handle the role enum properly
    if (role.isSystemRole) {
      user.role = role.systemRole; // "super_admin", "admin", or "department_editor"
    } else {
      user.role = "department_editor";
    }

    user.permissions = role.permissions || [];
    user.allowedPages = role.allowedPages || [];

    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-passwordHash")
      .populate('roleId', 'name description isSystemRole systemRole');

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


// ==========================================
// GET ALL USERS
// ==========================================

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .populate('roleId', 'name description isSystemRole systemRole');

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};


// ==========================================
// GET SINGLE USER
// ==========================================

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate('roleId', 'name description isSystemRole systemRole');

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


// ==========================================
// UPDATE USER
// ==========================================

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      department,
      status,
      permissions,
      allowedPages,
      contentAccess,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (department !== undefined) user.department = department?.trim() || null;
    if (status) user.status = status;
    if (permissions) user.permissions = permissions;
    if (allowedPages) user.allowedPages = allowedPages;
    if (contentAccess) user.contentAccess = contentAccess;

    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-passwordHash")
      .populate('roleId', 'name description isSystemRole systemRole');

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


// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};