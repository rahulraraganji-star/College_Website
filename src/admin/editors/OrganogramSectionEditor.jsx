import React, { useState, useMemo, useEffect } from "react";
import {
  Network,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  List,
  GitFork,
  Eye,
  RefreshCw,
  X,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import MediaPicker from "../media/components/MediaPicker";
import OrganogramSection from "../../Components/sections/OrganogramSection";
import {
  buildOrganogramTree,
  migrateDepartmentsToNodes,
} from "../../utils/organogramTree";

const API_URL = "/api";

const OrganogramSectionEditor = ({ section, onChange }) => {
  // View mode: 'tree' (visual tree chart) | 'outline' (hierarchical indented list)
  const [viewMode, setViewMode] = useState("tree");
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReassignTo, setDeleteReassignTo] = useState("parent"); // 'parent' | 'root' | 'cascade'

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    department: "",
    parentId: "",
    photo: null,
    email: "",
    phone: "",
    bio: "",
    order: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState("");

  /* =========================================================
     SAFE DATA INITIALIZATION & NORMALIZATION
     - Preserves any existing section.nodes
     - Safely converts legacy section.departments into hierarchical nodes
     - Does NOT create fake or dummy records
  ========================================================= */
  useEffect(() => {
    // If section has legacy departments but no nodes, automatically migrate
    if (
      (!section?.nodes || section.nodes.length === 0) &&
      Array.isArray(section?.departments) &&
      section.departments.length > 0
    ) {
      const migrated = migrateDepartmentsToNodes(section.departments);
      onChange({
        ...section,
        nodes: migrated,
      });
      setFeedbackMsg({
        type: "info",
        text: `Safely migrated ${migrated.length} positions from legacy department list.`,
      });
    }
  }, [section?.departments, section?.nodes]);

  // Current list of nodes
  const rawNodes = useMemo(() => {
    if (Array.isArray(section?.nodes) && section.nodes.length > 0) {
      return section.nodes;
    }
    if (Array.isArray(section?.departments) && section.departments.length > 0) {
      return migrateDepartmentsToNodes(section.departments);
    }
    return [];
  }, [section?.nodes, section?.departments]);

  // Build recursive tree from nodes
  const tree = useMemo(() => {
    return buildOrganogramTree(rawNodes);
  }, [rawNodes]);

  // Compute depth level and ancestor path for each node for the outline view & dropdown
  const nodeMetaMap = useMemo(() => {
    const meta = new Map();

    const walk = (nodesList, currentDepth, pathNames) => {
      nodesList.forEach((item) => {
        const id = String(item.id || item._id);
        const currentPath = [...pathNames, item.designation || item.name];
        meta.set(id, {
          depth: currentDepth,
          path: currentPath.join(" → "),
          childrenCount: item.children?.length || 0,
        });
        if (item.children?.length > 0) {
          walk(item.children, currentDepth + 1, currentPath);
        }
      });
    };

    walk(tree, 0, []);
    return meta;
  }, [tree]);

  // Helper: Find all descendant IDs of a given node to prevent cyclic references
  const getDescendantIds = (targetId) => {
    const descendants = new Set();
    const findChildren = (pid) => {
      rawNodes.forEach((n) => {
        const p = n.parentId ? String(n.parentId) : n.parent ? String(n.parent?._id || n.parent) : null;
        const currentId = String(n.id || n._id);
        if (p === String(pid)) {
          descendants.add(currentId);
          findChildren(currentId);
        }
      });
    };
    findChildren(targetId);
    return descendants;
  };

  /* =========================================================
     UPDATE SECTION HELPER
  ========================================================= */
  const updateNodes = (newNodes) => {
    onChange({
      ...section,
      nodes: newNodes,
    });
  };

  const handleFieldChange = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  /* =========================================================
     ADD / EDIT NODE HANDLERS
  ========================================================= */
  const handleOpenAddModal = (presetParentId = "") => {
    setEditingNodeId(null);
    setFormError("");

    // Calculate next order among siblings of this parent
    const siblings = rawNodes.filter((n) => {
      const p = n.parentId ? String(n.parentId) : n.parent ? String(n.parent?._id || n.parent) : "";
      return p === String(presetParentId || "");
    });

    setFormData({
      name: "",
      designation: "",
      department: "",
      parentId: presetParentId || "",
      photo: null,
      email: "",
      phone: "",
      bio: "",
      order: siblings.length,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (node) => {
    setEditingNodeId(String(node.id || node._id));
    setFormError("");

    const parentId = node.parentId
      ? String(node.parentId)
      : node.parent?._id
      ? String(node.parent._id)
      : node.parent
      ? String(node.parent)
      : "";

    setFormData({
      name: node.name || "",
      designation: node.designation || "",
      department: node.department || "",
      parentId: parentId || "",
      photo: node.photo || node.media || null,
      email: node.email || "",
      phone: node.phone || "",
      bio: node.bio || "",
      order: Number(node.order) || 0,
      isActive: node.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSaveNode = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.designation.trim()) {
      setFormError("Designation / Role Title is required.");
      return;
    }

    const parentVal = formData.parentId?.trim() ? formData.parentId.trim() : null;

    if (editingNodeId) {
      // Cycle detection
      if (parentVal === editingNodeId) {
        setFormError("A position cannot report to itself.");
        return;
      }
      const descendants = getDescendantIds(editingNodeId);
      if (parentVal && descendants.has(parentVal)) {
        setFormError("Circular hierarchy detected: cannot select a reporting sub-position as parent.");
        return;
      }

      const updated = rawNodes.map((n) => {
        if (String(n.id || n._id) === editingNodeId) {
          return {
            ...n,
            name: formData.name.trim(),
            designation: formData.designation.trim(),
            department: formData.department.trim(),
            parentId: parentVal,
            photo: formData.photo,
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            bio: formData.bio.trim(),
            order: Number(formData.order) || 0,
            isActive: Boolean(formData.isActive),
          };
        }
        return n;
      });

      updateNodes(updated);
    } else {
      const newNode = {
        id: `node_${crypto.randomUUID()}`,
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        parentId: parentVal,
        photo: formData.photo,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };

      updateNodes([...rawNodes, newNode]);
    }

    setModalOpen(false);
  };

  /* =========================================================
     DELETE NODE WITH SAFE REASSIGNMENT
  ========================================================= */
  const handleOpenDeleteModal = (node) => {
    setDeleteTarget(node);
    const parentId = node.parentId
      ? String(node.parentId)
      : node.parent?._id
      ? String(node.parent._id)
      : node.parent
      ? String(node.parent)
      : "";
    setDeleteReassignTo(parentId || "root");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = String(deleteTarget.id || deleteTarget._id);

    if (deleteReassignTo === "cascade") {
      // Delete target and all its descendants
      const descendants = getDescendantIds(targetId);
      const remaining = rawNodes.filter((n) => {
        const id = String(n.id || n._id);
        return id !== targetId && !descendants.has(id);
      });
      updateNodes(remaining);
    } else {
      // Reassign children to target's parent (or root if root selected)
      const targetParent =
        deleteReassignTo === "root" ? null : deleteReassignTo;

      const updated = rawNodes
        .filter((n) => String(n.id || n._id) !== targetId)
        .map((n) => {
          const p = n.parentId
            ? String(n.parentId)
            : n.parent?._id
            ? String(n.parent._id)
            : n.parent
            ? String(n.parent)
            : null;

          if (p === targetId) {
            return {
              ...n,
              parentId: targetParent,
            };
          }
          return n;
        });

      updateNodes(updated);
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  /* =========================================================
     SIBLING REPOSITIONING (MOVE LEFT / MOVE RIGHT / UP / DOWN)
  ========================================================= */
  const handleRepositionSibling = (node, direction) => {
    const targetId = String(node.id || node._id);
    const targetParentId = node.parentId
      ? String(node.parentId)
      : node.parent?._id
      ? String(node.parent._id)
      : node.parent
      ? String(node.parent)
      : null;

    // Get all siblings with same parent, sorted by order
    const siblings = rawNodes
      .filter((n) => {
        const p = n.parentId
          ? String(n.parentId)
          : n.parent?._id
          ? String(n.parent._id)
          : n.parent
          ? String(n.parent)
          : null;
        return p === targetParentId;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const currentIndex = siblings.findIndex(
      (n) => String(n.id || n._id) === targetId
    );
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const currentSibling = siblings[currentIndex];
    const swapSibling = siblings[targetIndex];

    const currentOrder = Number(currentSibling.order) || currentIndex;
    const swapOrder = Number(swapSibling.order) || targetIndex;

    const updated = rawNodes.map((n) => {
      const id = String(n.id || n._id);
      if (id === String(currentSibling.id || currentSibling._id)) {
        return { ...n, order: swapOrder };
      }
      if (id === String(swapSibling.id || swapSibling._id)) {
        return { ...n, order: currentOrder };
      }
      return n;
    });

    updateNodes(updated);
  };

  /* =========================================================
     OPTIONAL IMPORT FROM INSTITUTIONAL ORGANOGRAM
  ========================================================= */
  const handleImportInstitutional = async () => {
    setImporting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${API_URL}/organogram/admin/tree`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.nodes) && data.nodes.length > 0) {
        const importedNodes = data.nodes.map((n) => ({
          id: String(n._id),
          parentId: n.parent?._id ? String(n.parent._id) : (n.parent ? String(n.parent) : null),
          name: n.name,
          designation: n.designation,
          department: n.department || "",
          photo: n.photo || null,
          email: n.email || "",
          phone: n.phone || "",
          bio: n.bio || "",
          order: Number(n.order) || 0,
          isActive: n.isActive !== false,
        }));
        updateNodes(importedNodes);
        setFeedbackMsg({
          type: "success",
          text: `Loaded ${importedNodes.length} positions from institutional organogram.`,
        });
      } else {
        setFeedbackMsg({
          type: "error",
          text: "No positions found in institutional organogram database.",
        });
      }
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      setFeedbackMsg({
        type: "error",
        text: "Failed to connect to institutional organogram API.",
      });
    } finally {
      setImporting(false);
    }
  };

  const toggleCollapse = (id) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* =========================================================
     RECURSIVE TREE CHART NODE COMPONENT
  ========================================================= */
  const TreeNodeCard = ({ node, level = 0, siblingIndex = 0, totalSiblings = 1 }) => {
    const nodeId = String(node.id || node._id);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isCollapsed = Boolean(collapsedNodes[nodeId]);
    const photoUrl =
      node.photo?.url ||
      (typeof node.photo === "string" ? node.photo : null) ||
      node.media?.url ||
      (typeof node.media === "string" ? node.media : null);

    return (
      <div className="flex flex-col items-center relative">
        {/* Node Card Box */}
        <div
          className={`group relative z-10 w-72 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md bg-white ${
            node.isActive === false
              ? "border-neutral-300 opacity-70 bg-neutral-50"
              : "border-neutral-200 hover:border-black"
          }`}
        >
          {/* Top Level Accent Stripe */}
          <div
            className={`h-1.5 w-full rounded-t-2xl ${
              level === 0
                ? "bg-black"
                : level === 1
                ? "bg-neutral-800"
                : level === 2
                ? "bg-neutral-600"
                : "bg-neutral-400"
            }`}
          />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Photo or Monogram Avatar */}
              <div className="relative shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={node.name}
                    className="h-12 w-12 rounded-xl object-cover border border-neutral-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold text-sm">
                    {node.name
                      ? node.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "P"}
                  </div>
                )}
                {node.isActive === false && (
                  <span
                    title="Draft / Inactive"
                    className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-neutral-400 border-2 border-white"
                  />
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-black line-clamp-1">
                  {node.designation || "Untitled Position"}
                </p>
                <h4 className="font-semibold text-neutral-800 text-sm leading-snug truncate mt-0.5">
                  {node.name || "Unnamed"}
                </h4>
                {node.department && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium truncate max-w-full">
                    {node.department}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Card Action Toolbar */}
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                <span>L{level}</span>
                {totalSiblings > 1 && (
                  <div className="inline-flex items-center ml-1 gap-0.5">
                    <button
                      type="button"
                      disabled={siblingIndex === 0}
                      onClick={() => handleRepositionSibling(node, "prev")}
                      title="Move position left among siblings"
                      className="p-1 rounded text-neutral-500 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowLeft size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={siblingIndex === totalSiblings - 1}
                      onClick={() => handleRepositionSibling(node, "next")}
                      title="Move position right among siblings"
                      className="p-1 rounded text-neutral-500 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowRight size={11} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(nodeId)}
                  title="Add direct reporting child under this position"
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(node)}
                  title="Edit position details"
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(node)}
                  title="Delete position"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Child Subtree Expand/Collapse Toggle Button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCollapse(nodeId)}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-[11px] font-semibold text-neutral-800 shadow-sm hover:border-black transition-all"
            >
              <span>{node.children.length}</span>
              {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        {/* Tree Connectors & Sub-Branches (Horizontal underneath Parent) */}
        {hasChildren && !isCollapsed && (
          <div className="relative pt-6 flex flex-col items-center w-full">
            {/* Vertical connector stem down from parent card */}
            <div className="w-0.5 h-6 bg-neutral-300" />

            {/* Horizontal row of child branches */}
            <div className="flex flex-row items-start justify-center relative">
              {node.children.map((childNode, idx) => {
                const isOnly = node.children.length === 1;
                const isFirst = idx === 0;
                const isLast = idx === node.children.length - 1;

                return (
                  <div
                    key={childNode.id || childNode._id}
                    className="relative flex flex-col items-center px-4"
                  >
                    {/* Horizontal crossbar connecting sibling branches */}
                    {!isOnly && (
                      <div
                        className={`absolute top-0 h-0.5 bg-neutral-300 ${
                          isFirst
                            ? "left-1/2 right-0"
                            : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                        }`}
                      />
                    )}

                    {/* Vertical connector down from crossbar to child */}
                    <div className="w-0.5 h-6 bg-neutral-300 relative z-0" />

                    {/* Recursive child card */}
                    <TreeNodeCard
                      node={childNode}
                      level={level + 1}
                      siblingIndex={idx}
                      totalSiblings={node.children.length}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     RECURSIVE OUTLINE LIST COMPONENT
  ========================================================= */
  const OutlineRow = ({ node, level = 0, siblingIndex = 0, totalSiblings = 1 }) => {
    const nodeId = String(node.id || node._id);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isCollapsed = Boolean(collapsedNodes[nodeId]);
    const photoUrl =
      node.photo?.url ||
      (typeof node.photo === "string" ? node.photo : null) ||
      node.media?.url ||
      (typeof node.media === "string" ? node.media : null);

    return (
      <div className="flex flex-col border-b border-neutral-100 last:border-b-0">
        <div
          className={`flex items-center justify-between py-2.5 px-3 hover:bg-neutral-50/80 transition-colors ${
            level === 0 ? "bg-neutral-50/40" : ""
          }`}
          style={{ paddingLeft: `${Math.max(12, level * 28 + 12)}px` }}
        >
          {/* Left: Indicator, photo, designation, name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCollapse(nodeId)}
                className="p-1 rounded text-neutral-400 hover:text-black hover:bg-neutral-200 transition-colors shrink-0"
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              </span>
            )}

            {photoUrl ? (
              <img
                src={photoUrl}
                alt={node.name}
                className="h-8 w-8 rounded-lg object-cover border border-neutral-200 shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center justify-center shrink-0">
                {node.name ? node.name.slice(0, 2).toUpperCase() : "P"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  {node.designation}
                </span>
                <span className="text-xs font-semibold text-neutral-800">
                  {node.name}
                </span>
                {node.department && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                    {node.department}
                  </span>
                )}
                {hasChildren && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-semibold">
                    {node.children.length} direct reporting
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-3">
            {totalSiblings > 1 && (
              <div className="flex items-center mr-1">
                <button
                  type="button"
                  disabled={siblingIndex === 0}
                  onClick={() => handleRepositionSibling(node, "prev")}
                  title="Move position up among siblings"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-20"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  disabled={siblingIndex === totalSiblings - 1}
                  onClick={() => handleRepositionSibling(node, "next")}
                  title="Move position down among siblings"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-20"
                >
                  <ArrowDown size={13} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleOpenAddModal(nodeId)}
              title="Add reporting sub-position"
              className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 text-xs font-medium inline-flex items-center gap-1"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add Child</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenEditModal(node)}
              title="Edit position"
              className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenDeleteModal(node)}
              title="Delete position"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Recursive Children Rows */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {node.children.map((childNode, idx) => (
              <OutlineRow
                key={childNode.id || childNode._id}
                node={childNode}
                level={level + 1}
                siblingIndex={idx}
                totalSiblings={node.children.length}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SECTION TITLE & SUBHEADING */}
      <div className="p-5 bg-white rounded-2xl border border-neutral-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              placeholder="Institutional Organogram"
              value={section?.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Section Subheading
            </label>
            <input
              type="text"
              placeholder="Hierarchical governance and operational reporting structure."
              value={section?.subheading || ""}
              onChange={(e) => handleFieldChange("subheading", e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black transition"
            />
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : feedbackMsg.type === "info"
              ? "bg-neutral-50 border-neutral-200 text-neutral-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-neutral-400 hover:text-neutral-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ORGANOGRAM CONTROLS TOOLBAR */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Summary & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "tree"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <GitFork size={13} />
              <span>Tree Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("outline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "outline"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <List size={13} />
              <span>Hierarchy Outline</span>
            </button>
          </div>

          <span className="text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-50 rounded-lg border border-neutral-200">
            {rawNodes.length} Position{rawNodes.length !== 1 ? "s" : ""} in Hierarchy
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {rawNodes.length === 0 && (
            <button
              type="button"
              disabled={importing}
              onClick={handleImportInstitutional}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition"
            >
              <RefreshCw size={13} className={importing ? "animate-spin" : ""} />
              <span>Import Institutional Structure</span>
            </button>
          )}

          {rawNodes.length > 0 && (
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition"
            >
              <Eye size={13} />
              <span>Full Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenAddModal("")}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 text-xs font-semibold transition"
          >
            <Plus size={14} />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {rawNodes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-neutral-300 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
            <Network size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-neutral-900">
              No Organizational Positions Configured
            </h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Start by creating the top-level governing role (e.g. Governing Board or Principal), then add reporting children downward recursively.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal("")}
              className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 text-xs font-semibold transition"
            >
              + Add Top-Level Position
            </button>
            <button
              type="button"
              disabled={importing}
              onClick={handleImportInstitutional}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={importing ? "animate-spin" : ""} />
              <span>Load from Institutional Tree</span>
            </button>
          </div>
        </div>
      ) : viewMode === "tree" ? (
        /* =========================================================
           TREE CHART VIEW
           - Parent at the top
           - Children arranged horizontally underneath parent
           - Clean connecting lines between parent and children
           - Unlimited recursive horizontal child branches
        ========================================================= */
        <div className="bg-neutral-50/60 rounded-2xl border border-neutral-200 p-8 overflow-x-auto min-h-[460px]">
          <div className="flex flex-col items-center gap-12 min-w-max mx-auto px-4">
            {tree.map((rootNode, idx) => (
              <TreeNodeCard
                key={rootNode.id || rootNode._id}
                node={rootNode}
                level={0}
                siblingIndex={idx}
                totalSiblings={tree.length}
              />
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================
           HIERARCHY OUTLINE VIEW
           - Clean indented list showing the full parent-child reporting structure
        ========================================================= */
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="py-2.5 px-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <span>Position Reporting Hierarchy</span>
            <span>Actions & Reorder</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {tree.map((rootNode, idx) => (
              <OutlineRow
                key={rootNode.id || rootNode._id}
                node={rootNode}
                level={0}
                siblingIndex={idx}
                totalSiblings={tree.length}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
         ADD / EDIT POSITION MODAL
      ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-neutral-100 text-black flex items-center justify-center font-bold">
                  {editingNodeId ? <Pencil size={15} /> : <Plus size={16} />}
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  {editingNodeId ? "Edit Position Details" : "Add Organizational Position"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNode} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Photo Selector */}
              <div>
                <MediaPicker
                  label="Official Photo / Avatar"
                  value={formData.photo}
                  onChange={(media) =>
                    setFormData((prev) => ({ ...prev, photo: media }))
                  }
                />
              </div>

              {/* Designation & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Designation / Role Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal / Head"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rev. Dr. Father Agnelo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              {/* Department & Reports To (Parent Selection) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Department / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Executive Leadership, BCA"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Reports To (Parent Position)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-black font-medium"
                  >
                    <option value="">(None — Top Level / Apex Position)</option>
                    {rawNodes
                      .filter((n) => {
                        const id = String(n.id || n._id);
                        if (!editingNodeId) return true;
                        if (id === editingNodeId) return false;
                        const descendants = getDescendantIds(editingNodeId);
                        return !descendants.has(id);
                      })
                      .map((n) => {
                        const id = String(n.id || n._id);
                        const meta = nodeMetaMap.get(id);
                        const depthPrefix = "— ".repeat(meta?.depth || 0);
                        return (
                          <option key={id} value={id}>
                            {depthPrefix}
                            {n.designation || n.name} ({n.name})
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Optional Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="official@agnel.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Phone / Extension
                  </label>
                  <input
                    type="text"
                    placeholder="+91 (0832) 2777000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Sibling Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-5">
                  <input
                    type="checkbox"
                    id="nodeActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="nodeActiveCheck"
                    className="text-xs font-bold text-neutral-800 cursor-pointer"
                  >
                    Active & Published in Tree
                  </label>
                </div>
              </div>

              {/* Bio / Key Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Brief Responsibilities / Portfolio Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Key administrative responsibilities or operational portfolio..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition"
                >
                  {editingNodeId ? "Save Changes" : "Add Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
         DELETE CONFIRMATION MODAL
      ========================================================= */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Delete Position
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to remove this position?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1">
              <p>
                <strong>Position:</strong> {deleteTarget.designation}
              </p>
              <p>
                <strong>Person:</strong> {deleteTarget.name}
              </p>
            </div>

            {/* Check for reporting child positions */}
            {(() => {
              const targetId = String(deleteTarget.id || deleteTarget._id);
              const children = rawNodes.filter((n) => {
                const p = n.parentId
                  ? String(n.parentId)
                  : n.parent?._id
                  ? String(n.parent._id)
                  : n.parent
                  ? String(n.parent)
                  : null;
                return p === targetId;
              });

              if (children.length === 0) return null;

              return (
                <div className="space-y-2 p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-neutral-700" />
                    <span>
                      {children.length} Sub-position{children.length !== 1 ? "s" : ""} report to this role:
                    </span>
                  </p>
                  <ul className="list-disc pl-4 text-neutral-600 space-y-0.5 max-h-24 overflow-y-auto">
                    {children.map((c) => (
                      <li key={c.id || c._id}>
                        {c.designation} ({c.name})
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <label className="block font-bold text-neutral-800 mb-1">
                      Action for reporting sub-positions:
                    </label>
                    <select
                      value={deleteReassignTo}
                      onChange={(e) => setDeleteReassignTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:border-black"
                    >
                      <option value="parent">
                        Reassign to parent of deleted position
                      </option>
                      <option value="root">
                        Elevate to Top Level (Apex)
                      </option>
                      <option value="cascade">
                        Delete this position AND all its sub-positions
                      </option>
                    </select>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         LIVE ORGANOGRAM PREVIEW MODAL
      ========================================================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F8F5F0] rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-neutral-300 flex flex-col">
            <div className="p-4 sm:p-5 bg-white border-b border-neutral-200 flex items-center justify-between sticky top-0 z-20 rounded-t-3xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Public Website Preview
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {section?.title || "Institutional Organogram"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-10">
              <OrganogramSection
                section={{
                  title: section?.title || "Institutional Organogram",
                  subheading:
                    section?.subheading ||
                    "Hierarchical governance and operational reporting structure.",
                  nodes: rawNodes,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganogramSectionEditor;
