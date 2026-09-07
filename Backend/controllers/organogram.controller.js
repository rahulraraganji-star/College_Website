import mongoose from "mongoose";
import OrganogramNode from "../models/OrganogramNode.js";
import { createApprovalRequest } from "../services/approvalService.js";
import { createAuditLog } from "../services/auditService.js";

/* ==========================================
   IN-MEMORY CACHE FOR PUBLIC ORGANOGRAM
========================================== */

let cachedPublicOrganogram = null;

export const clearOrganogramCache = () => {
  cachedPublicOrganogram = null;
};

/* ==========================================
   HELPER: DETECT CYCLES IN HIERARCHY
========================================== */

const isDescendant = async (potentialAncestorId, targetId) => {
  if (!potentialAncestorId || !targetId) return false;
  if (potentialAncestorId.toString() === targetId.toString()) return true;

  const children = await OrganogramNode.find({ parent: potentialAncestorId }).select("_id").lean();
  for (const child of children) {
    if (child._id.toString() === targetId.toString()) return true;
    const found = await isDescendant(child._id, targetId);
    if (found) return true;
  }
  return false;
};

/* ==========================================
   PUBLIC: GET ORGANOGRAM HIERARCHY
========================================== */

export const getPublicOrganogram = async (req, res) => {
  try {
    if (cachedPublicOrganogram) {
      return res.json(cachedPublicOrganogram);
    }

    const nodes = await OrganogramNode.find({
      isActive: { $ne: false },
    })
      .sort({ level: 1, order: 1, createdAt: 1 })
      .lean();

    // Map into nested hierarchy tree
    const nodeMap = new Map();
    const tree = [];

    nodes.forEach((node) => {
      nodeMap.set(node._id.toString(), {
        ...node,
        children: [],
      });
    });

    nodes.forEach((node) => {
      const parentId = node.parent ? node.parent.toString() : null;
      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId).children.push(nodeMap.get(node._id.toString()));
      } else {
        tree.push(nodeMap.get(node._id.toString()));
      }
    });

    const response = {
      success: true,
      nodes,
      tree,
      total: nodes.length,
    };

    cachedPublicOrganogram = response;
    res.json(response);
  } catch (error) {
    console.error("GET PUBLIC ORGANOGRAM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organogram data.",
    });
  }
};

/* ==========================================
   ADMIN: GET ALL ORGANOGRAM NODES
========================================== */

export const getAdminOrganogram = async (req, res) => {
  try {
    const nodes = await OrganogramNode.find()
      .populate("parent", "name designation department")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ level: 1, order: 1, createdAt: 1 })
      .lean();

    // Build hierarchy tree
    const nodeMap = new Map();
    const tree = [];

    nodes.forEach((node) => {
      nodeMap.set(node._id.toString(), {
        ...node,
        children: [],
      });
    });

    nodes.forEach((node) => {
      const parentId = node.parent?._id ? node.parent._id.toString() : (node.parent ? node.parent.toString() : null);
      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId).children.push(nodeMap.get(node._id.toString()));
      } else {
        tree.push(nodeMap.get(node._id.toString()));
      }
    });

    res.json({
      success: true,
      nodes,
      tree,
      total: nodes.length,
    });
  } catch (error) {
    console.error("GET ADMIN ORGANOGRAM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin organogram data.",
    });
  }
};

/* ==========================================
   ADMIN: GET NODE BY ID
========================================== */

export const getOrganogramNodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const node = await OrganogramNode.findById(id)
      .populate("parent", "name designation department")
      .lean();

    if (!node) {
      return res.status(404).json({
        success: false,
        message: "Organogram node not found.",
      });
    }

    res.json({
      success: true,
      node,
    });
  } catch (error) {
    console.error("GET NODE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch node details.",
    });
  }
};

/* ==========================================
   ADMIN: CREATE NODE
========================================== */

export const createOrganogramNode = async (req, res) => {
  try {
    const {
      name,
      designation,
      department = "",
      photo = null,
      parent = null,
      order = 0,
      isActive = true,
      email = "",
      phone = "",
      bio = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!designation?.trim()) {
      return res.status(400).json({ success: false, message: "Designation is required." });
    }

    let calculatedLevel = 0;
    if (parent) {
      const parentNode = await OrganogramNode.findById(parent);
      if (!parentNode) {
        return res.status(400).json({ success: false, message: "Selected parent node not found." });
      }
      calculatedLevel = (parentNode.level || 0) + 1;
    }

    const canPublishDirectly =
      req.authUser.role === "super_admin" || req.authUser.role === "admin";

    const nodePayload = {
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      photo,
      parent: parent || null,
      order: Number(order) || 0,
      isActive: Boolean(isActive),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      level: calculatedLevel,
      createdBy: req.authUser._id,
      updatedBy: req.authUser._id,
    };

    /* ------------------------------------------
       APPROVAL REQUIRED (Department Editor / Non-Admin)
    ------------------------------------------ */
    if (!canPublishDirectly) {
      const { approvalRequest } = await createApprovalRequest({
        req,
        actor: req.authUser,
        resourceType: "organogram",
        resourceName: `${nodePayload.name} (${nodePayload.designation})`,
        action: "create",
        before: null,
        after: nodePayload,
      });

      return res.status(202).json({
        success: true,
        message: "Organogram creation submitted for Admin approval.",
        approvalRequired: true,
        approvalRequestId: approvalRequest._id,
      });
    }

    /* ------------------------------------------
       DIRECT CREATION (Admin / Super Admin)
    ------------------------------------------ */
    const node = await OrganogramNode.create(nodePayload);
    clearOrganogramCache();

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "organogram",
      resourceId: node._id,
      resourceName: `${node.name} (${node.designation})`,
      action: "create",
      before: null,
      after: node.toObject(),
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    res.status(201).json({
      success: true,
      message: "Organogram position created successfully.",
      node,
    });
  } catch (error) {
    console.error("CREATE NODE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create organogram position.",
    });
  }
};

/* ==========================================
   ADMIN: UPDATE NODE
========================================== */

export const updateOrganogramNode = async (req, res) => {
  try {
    const { id } = req.params;
    const existingNode = await OrganogramNode.findById(id);

    if (!existingNode) {
      return res.status(404).json({
        success: false,
        message: "Organogram position not found.",
      });
    }

    const {
      name,
      designation,
      department,
      photo,
      parent,
      order,
      isActive,
      email,
      phone,
      bio,
    } = req.body;

    // Cycle & self-parent validation
    if (parent) {
      if (parent.toString() === id.toString()) {
        return res.status(400).json({
          success: false,
          message: "A position cannot report to itself.",
        });
      }

      const cycleFound = await isDescendant(id, parent);
      if (cycleFound) {
        return res.status(400).json({
          success: false,
          message: "Circular hierarchy detected: a position cannot report to its own descendant.",
        });
      }
    }

    let calculatedLevel = 0;
    if (parent) {
      const parentNode = await OrganogramNode.findById(parent);
      if (parentNode) {
        calculatedLevel = (parentNode.level || 0) + 1;
      }
    }

    const canPublishDirectly =
      req.authUser.role === "super_admin" || req.authUser.role === "admin";

    const updatePayload = {
      name: name !== undefined ? name.trim() : existingNode.name,
      designation: designation !== undefined ? designation.trim() : existingNode.designation,
      department: department !== undefined ? department.trim() : existingNode.department,
      photo: photo !== undefined ? photo : existingNode.photo,
      parent: parent !== undefined ? (parent || null) : existingNode.parent,
      order: order !== undefined ? Number(order) : existingNode.order,
      isActive: isActive !== undefined ? Boolean(isActive) : existingNode.isActive,
      email: email !== undefined ? email.trim() : existingNode.email,
      phone: phone !== undefined ? phone.trim() : existingNode.phone,
      bio: bio !== undefined ? bio.trim() : existingNode.bio,
      level: calculatedLevel,
      updatedBy: req.authUser._id,
    };

    /* ------------------------------------------
       APPROVAL REQUIRED
    ------------------------------------------ */
    if (!canPublishDirectly) {
      const before = existingNode.toObject();
      const after = {
        ...before,
        ...updatePayload,
      };

      const { approvalRequest } = await createApprovalRequest({
        req,
        actor: req.authUser,
        resourceType: "organogram",
        resourceId: existingNode._id,
        resourceName: `${existingNode.name} (${existingNode.designation})`,
        action: "update",
        before,
        after,
      });

      return res.status(202).json({
        success: true,
        message: "Organogram changes submitted for Admin approval.",
        approvalRequired: true,
        approvalRequestId: approvalRequest._id,
      });
    }

    /* ------------------------------------------
       DIRECT UPDATE
    ------------------------------------------ */
    const updatedNode = await OrganogramNode.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    clearOrganogramCache();

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "organogram",
      resourceId: updatedNode._id,
      resourceName: `${updatedNode.name} (${updatedNode.designation})`,
      action: "update",
      before: existingNode.toObject(),
      after: updatedNode.toObject(),
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    res.json({
      success: true,
      message: "Organogram position updated successfully.",
      node: updatedNode,
    });
  } catch (error) {
    console.error("UPDATE NODE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update organogram position.",
    });
  }
};

/* ==========================================
   ADMIN: DELETE NODE WITH SAFETY
========================================== */

export const deleteOrganogramNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { reassignTo } = req.body || {};

    const existingNode = await OrganogramNode.findById(id);
    if (!existingNode) {
      return res.status(404).json({
        success: false,
        message: "Organogram position not found.",
      });
    }

    // Check for child reporting nodes
    const children = await OrganogramNode.find({ parent: id });

    const canPublishDirectly =
      req.authUser.role === "super_admin" || req.authUser.role === "admin";

    /* ------------------------------------------
       APPROVAL REQUIRED
    ------------------------------------------ */
    if (!canPublishDirectly) {
      const { approvalRequest } = await createApprovalRequest({
        req,
        actor: req.authUser,
        resourceType: "organogram",
        resourceId: existingNode._id,
        resourceName: `${existingNode.name} (${existingNode.designation})`,
        action: "delete",
        before: existingNode.toObject(),
        after: {
          reassignTo: reassignTo || existingNode.parent || null,
          affectedChildrenCount: children.length,
        },
      });

      return res.status(202).json({
        success: true,
        message: "Organogram deletion submitted for Admin approval.",
        approvalRequired: true,
        approvalRequestId: approvalRequest._id,
      });
    }

    /* ------------------------------------------
       DIRECT DELETE (SAFE CHILD REASSIGNMENT)
    ------------------------------------------ */
    let targetParent = existingNode.parent || null;
    if (reassignTo !== undefined) {
      targetParent = reassignTo ? new mongoose.Types.ObjectId(reassignTo) : null;
    }

    if (children.length > 0) {
      await OrganogramNode.updateMany(
        { parent: id },
        { $set: { parent: targetParent } }
      );
    }

    await OrganogramNode.findByIdAndDelete(id);
    clearOrganogramCache();

    await createAuditLog({
      req,
      actor: req.authUser,
      resourceType: "organogram",
      resourceId: existingNode._id,
      resourceName: `${existingNode.name} (${existingNode.designation})`,
      action: "delete",
      before: existingNode.toObject(),
      after: {
        deleted: true,
        reassignedChildrenCount: children.length,
        reassignedToParent: targetParent,
      },
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    res.json({
      success: true,
      message: `Position deleted successfully.${children.length > 0 ? ` ${children.length} reporting sub-positions were safely reassigned.` : ""}`,
    });
  } catch (error) {
    console.error("DELETE NODE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete organogram position.",
    });
  }
};

/* ==========================================
   ADMIN: BATCH REORDER NODES
========================================== */

export const reorderOrganogramNodes = async (req, res) => {
  try {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Valid items array is required." });
    }

    const updates = items.map((item) =>
      OrganogramNode.findByIdAndUpdate(item.id, {
        $set: {
          order: item.order !== undefined ? Number(item.order) : 0,
          parent: item.parent !== undefined ? (item.parent || null) : undefined,
        },
      })
    );

    await Promise.all(updates);
    clearOrganogramCache();

    res.json({
      success: true,
      message: "Organogram hierarchy reordered successfully.",
    });
  } catch (error) {
    console.error("REORDER NODES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder organogram positions.",
    });
  }
};
