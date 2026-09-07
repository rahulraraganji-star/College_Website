import React, { useEffect, useState, useMemo } from "react";
import {
  Network,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  Building,
  Mail,
  Phone,
  ArrowUp,
  ArrowDown,
  Layers,
  List,
  GitFork,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MediaPicker from "../media/components/MediaPicker";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import OrganogramSection from "../../Components/sections/OrganogramSection";

const API_URL = "/api";

const OrganogramManager = () => {
  const { user, hasPermission } = useAuth();

  const canCreate = hasPermission("organogram.create");
  const canEdit = hasPermission("organogram.edit");
  const canDelete = hasPermission("organogram.delete");
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const requiresApproval = !isSuperAdmin && !isAdmin;

  // Data State
  const [nodes, setNodes] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [viewMode, setViewMode] = useState("tree"); // 'tree' | 'list'
  const [collapsedNodes, setCollapsedNodes] = useState({});

  // Modal State
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReassignTo, setDeleteReassignTo] = useState("parent");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    department: "",
    photo: null,
    parent: "",
    order: 0,
    isActive: true,
    email: "",
    phone: "",
    bio: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ==========================================
  // FETCH ORGANOGRAM DATA
  // ==========================================
  const fetchOrganogramData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/organogram/admin/tree`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setNodes(data.nodes || []);
        setTree(data.tree || []);
      } else {
        showToast(data.message || "Failed to load organogram.", "error");
      }
    } catch (err) {
      console.error("FETCH ORGANOGRAM ERROR:", err);
      showToast("Error loading organogram data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganogramData();
  }, []);

  // Departments List for filtering
  const departments = useMemo(() => {
    const depts = new Set();
    nodes.forEach((n) => {
      if (n.department?.trim()) depts.add(n.department.trim());
    });
    return Array.from(depts);
  }, [nodes]);

  // Find all descendant IDs of a given node (to prevent circular parent selection)
  const getDescendantIds = (nodeId) => {
    const descendants = new Set();
    const findChildren = (pid) => {
      nodes.forEach((n) => {
        const p = n.parent?._id || n.parent;
        if (p === pid) {
          descendants.add(n._id);
          findChildren(n._id);
        }
      });
    };
    findChildren(nodeId);
    return descendants;
  };

  // ==========================================
  // MODAL OPEN / CLOSE HANDLERS
  // ==========================================
  const handleOpenAddModal = (presetParentId = "") => {
    setEditingNode(null);
    setFormData({
      name: "",
      designation: "",
      department: "",
      photo: null,
      parent: presetParentId || "",
      order: nodes.length,
      isActive: true,
      email: "",
      phone: "",
      bio: "",
    });
    setFormError("");
    setShowNodeModal(true);
  };

  const handleOpenEditModal = (node) => {
    setEditingNode(node);
    const parentId = node.parent?._id || (node.parent ? node.parent.toString() : "");
    setFormData({
      name: node.name || "",
      designation: node.designation || "",
      department: node.department || "",
      photo: node.photo || null,
      parent: parentId || "",
      order: node.order || 0,
      isActive: node.isActive !== false,
      email: node.email || "",
      phone: node.phone || "",
      bio: node.bio || "",
    });
    setFormError("");
    setShowNodeModal(true);
  };

  const handleOpenDeleteModal = (node) => {
    setDeleteTarget(node);
    const parentId = node.parent?._id || (node.parent ? node.parent.toString() : "");
    setDeleteReassignTo(parentId || "root");
    setShowDeleteModal(true);
  };

  // ==========================================
  // SUBMIT FORM (CREATE / UPDATE)
  // ==========================================
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.designation.trim()) {
      setFormError("Designation is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const url = editingNode
        ? `${API_URL}/organogram/${editingNode._id}`
        : `${API_URL}/organogram`;
      const method = editingNode ? "PUT" : "POST";

      const payload = {
        ...formData,
        parent: formData.parent ? formData.parent : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 202) {
        showToast(
          data.message || "Submitted for Administrator approval.",
          "info"
        );
        setShowNodeModal(false);
        fetchOrganogramData();
        return;
      }

      if (data.success) {
        showToast(
          editingNode
            ? "Position updated successfully."
            : "Position created successfully.",
          "success"
        );
        setShowNodeModal(false);
        fetchOrganogramData();
      } else {
        setFormError(data.message || "Failed to save position.");
      }
    } catch (err) {
      console.error("SAVE NODE ERROR:", err);
      setFormError("An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // CONFIRM DELETE
  // ==========================================
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      const reassignParam =
        deleteReassignTo === "root" ? null : deleteReassignTo;

      const res = await fetch(`${API_URL}/organogram/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reassignTo: reassignParam }),
      });

      const data = await res.json();

      if (res.status === 202) {
        showToast(
          data.message || "Deletion submitted for Administrator approval.",
          "info"
        );
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchOrganogramData();
        return;
      }

      if (data.success) {
        showToast(data.message || "Position deleted successfully.", "success");
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchOrganogramData();
      } else {
        showToast(data.message || "Failed to delete position.", "error");
      }
    } catch (err) {
      console.error("DELETE ERROR:", err);
      showToast("Error deleting position.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered nodes for List view
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchSearch =
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.department &&
          n.department.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDept =
        selectedDept === "all" ||
        (n.department && n.department.trim() === selectedDept);
      return matchSearch && matchDept;
    });
  }, [nodes, searchQuery, selectedDept]);

  // Toggle Collapse in Tree View
  const toggleCollapse = (nodeId) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // ==========================================
  // RECURSIVE TREE NODE COMPONENT
  // ==========================================
  const TreeNodeItem = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = Boolean(collapsedNodes[node._id]);
    const photoUrl =
      node.photo?.url ||
      (typeof node.photo === "string" ? node.photo : null);

    return (
      <div className="relative flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`group relative z-10 w-80 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
            node.isActive === false
              ? "bg-neutral-50 border-neutral-300 opacity-70"
              : "bg-white border-neutral-200 hover:border-amber-400"
          }`}
        >
          {/* Top Banner accent */}
          <div
            className={`h-1.5 w-full rounded-t-2xl ${
              level === 0
                ? "bg-amber-600"
                : level === 1
                ? "bg-amber-500"
                : level === 2
                ? "bg-blue-500"
                : "bg-neutral-400"
            }`}
          />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Photo / Avatar */}
              <div className="relative shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={node.name}
                    className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shadow-inner"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-base">
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
                    className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-neutral-400 border-2 border-white"
                  />
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-neutral-900 text-[14.5px] leading-tight truncate">
                  {node.name}
                </h4>
                <p className="text-[12.5px] font-medium text-amber-700 leading-snug mt-0.5">
                  {node.designation}
                </p>
                {node.department && (
                  <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium truncate max-w-full">
                    {node.department}
                  </span>
                )}
              </div>
            </div>

            {/* Contact & Meta footer */}
            {(node.email || node.phone) && (
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-3 text-[11.5px] text-neutral-500">
                {node.email && (
                  <span className="flex items-center gap-1 truncate" title={node.email}>
                    <Mail size={12} className="text-neutral-400" />
                    <span className="truncate">{node.email}</span>
                  </span>
                )}
                {node.phone && (
                  <span className="flex items-center gap-1" title={node.phone}>
                    <Phone size={12} className="text-neutral-400" />
                    <span>{node.phone}</span>
                  </span>
                )}
              </div>
            )}

            {/* Card Action Toolbar */}
            <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider">
                Level {level} • Order {node.order}
              </span>

              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(node._id)}
                    title="Add reporting sub-position"
                    className="p-1.5 text-neutral-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(node)}
                    title="Edit position"
                    className="p-1.5 text-neutral-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(node)}
                    title="Delete position"
                    className="p-1.5 text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Child Expand/Collapse Toggle Button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCollapse(node._id)}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-[11px] font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-amber-400 transition-all"
            >
              <span>{node.children.length}</span>
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Child Subtree Branches with Connectors */}
        {hasChildren && !isCollapsed && (
          <div className="relative pt-8 flex flex-col items-center">
            {/* Vertical connector down from parent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-neutral-300" />

            <div className="flex items-start justify-center gap-8 relative">
              {/* Horizontal crossbar connecting siblings */}
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-neutral-300"
                  style={{
                    left: "50%",
                    right: "50%",
                    marginLeft: `-${(node.children.length - 1) * 160}px`,
                    marginRight: `-${(node.children.length - 1) * 160}px`,
                  }}
                />
              )}

              {node.children.map((childNode) => (
                <div key={childNode._id} className="relative flex flex-col items-center">
                  {/* Vertical connector up to horizontal bar */}
                  <div className="w-0.5 h-6 bg-neutral-300 -mt-6 mb-2" />
                  <TreeNodeItem node={childNode} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Network size={20} />
            </div>
            <h1 className="text-[28px] font-extrabold text-black tracking-tight">
              Organogram & Governance Hierarchy
            </h1>
          </div>
          <p className="text-[14px] text-neutral-500 mt-1.5 max-w-2xl">
            Configure the institution’s organizational hierarchy, leadership reporting relationships, and governance tree. Live changes reflect dynamically on the public portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 text-sm font-medium transition-colors shadow-sm"
          >
            <Eye size={15} />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={fetchOrganogramData}
            title="Reload Organogram"
            className="p-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => handleOpenAddModal("")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Add Position</span>
            </button>
          )}
        </div>
      </div>

      {/* Approval Notice for Non-Admins */}
      {requiresApproval && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-amber-900 text-sm">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Administrator Approval Workflow Active</p>
            <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
              Your role requires Super Admin / Admin review. Additions, modifications, and deletions will be held in <strong>Pending</strong> state until approved. Live public organogram data remains untouched until approval.
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & Dept Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search position, name, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">All Departments ({nodes.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200">
          <button
            type="button"
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "tree"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <GitFork size={14} />
            <span>Tree Hierarchy</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <List size={14} />
            <span>List Matrix ({filteredNodes.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-neutral-200">
          <RefreshCw className="animate-spin text-amber-600 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-neutral-500">Loading organogram structure...</p>
        </div>
      ) : nodes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
          <Network size={44} className="mx-auto text-neutral-300 mb-3" />
          <h3 className="text-base font-semibold text-neutral-800">No Organizational Positions Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
            Get started by adding the top-level governing position (e.g. Governing Board or Principal).
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={() => handleOpenAddModal("")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-sm"
            >
              <Plus size={16} />
              <span>Add Apex / Root Position</span>
            </button>
          )}
        </div>
      ) : viewMode === "tree" ? (
        /* TREE HIERARCHY VIEW */
        <div className="bg-neutral-50/50 rounded-2xl border border-neutral-200 p-8 overflow-x-auto min-h-[500px]">
          <div className="flex flex-col items-center gap-10 min-w-max mx-auto">
            {tree.map((rootNode) => (
              <TreeNodeItem key={rootNode._id} node={rootNode} level={0} />
            ))}
          </div>
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Position & Person</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Reports To (Parent)</th>
                  <th className="px-3 py-3.5 text-center">Level</th>
                  <th className="px-3 py-3.5 text-center">Order</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredNodes.map((node) => {
                  const photoUrl =
                    node.photo?.url ||
                    (typeof node.photo === "string" ? node.photo : null);

                  return (
                    <tr key={node._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={node.name}
                              className="h-10 w-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 text-xs">
                              {node.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900 leading-tight">
                              {node.name}
                            </p>
                            <p className="text-xs text-amber-700 font-medium">
                              {node.designation}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-neutral-600">
                        {node.department || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-neutral-700">
                        {node.parent?.name ? (
                          <span className="inline-flex items-center gap-1.5 text-neutral-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{node.parent.name}</span>
                            <span className="text-neutral-400 text-[11px]">
                              ({node.parent.designation})
                            </span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">
                            (Root / Top Level)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-medium">
                          L{node.level || 0}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono text-xs text-neutral-600">
                        {node.order}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {node.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canCreate && (
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(node._id)}
                              title="Add child position"
                              className="p-1.5 text-neutral-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Plus size={15} />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(node)}
                              title="Edit position"
                              className="p-1.5 text-neutral-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(node)}
                              title="Delete position"
                              className="p-1.5 text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          ADD / EDIT POSITION MODAL
      ========================================== */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  {editingNode ? <Pencil size={16} /> : <Plus size={16} />}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 font-['Fraunces']">
                  {editingNode ? "Edit Position Details" : "Add Organizational Position"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNodeModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Photo Selector via MediaPicker */}
              <div>
                <MediaPicker
                  label="Official Photo / Avatar"
                  value={formData.photo}
                  onChange={(media) =>
                    setFormData((prev) => ({ ...prev, photo: media }))
                  }
                />
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Father Agnelo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Designation / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal / Dean"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Department & Reports To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Department / Administrative Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Governance, Academics, IQAC"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Reports To (Parent Node)
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, parent: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    <option value="">(None — Top-level Governance / Apex Body)</option>
                    {nodes
                      .filter((n) => {
                        // Prevent self & descendants selection to prevent cycle
                        if (!editingNode) return true;
                        if (n._id === editingNode._id) return false;
                        const descendants = getDescendantIds(editingNode._id);
                        return !descendants.has(n._id);
                      })
                      .map((n) => (
                        <option key={n._id} value={n._id}>
                          {n.name} — {n.designation} {n.department ? `(${n.department})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="principal@agnel.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Display Order
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
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label
                    htmlFor="isActiveToggle"
                    className="text-sm font-semibold text-neutral-800 cursor-pointer"
                  >
                    Active & Published
                  </label>
                </div>
              </div>

              {/* Bio / Key Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Overview / Key Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Key administrative responsibilities or portfolio overview..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingNode
                    ? "Update Position"
                    : "Create Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION & REASSIGNMENT MODAL
      ========================================== */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-['Fraunces']">
                  Delete Position Confirmation
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to remove this position?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1">
              <p>
                <strong>Position:</strong> {deleteTarget.name} ({deleteTarget.designation})
              </p>
              {deleteTarget.department && (
                <p>
                  <strong>Unit:</strong> {deleteTarget.department}
                </p>
              )}
            </div>

            {/* Safe Child Reassignment Options */}
            {(() => {
              const children = nodes.filter(
                (n) =>
                  (n.parent?._id || n.parent)?.toString() ===
                  deleteTarget._id.toString()
              );

              if (children.length === 0) return null;

              return (
                <div className="space-y-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>
                      {children.length} Sub-position{children.length !== 1 ? "s" : ""} report to this role:
                    </span>
                  </p>
                  <ul className="list-disc pl-4 text-amber-800 space-y-0.5">
                    {children.slice(0, 3).map((c) => (
                      <li key={c._id}>
                        {c.name} ({c.designation})
                      </li>
                    ))}
                    {children.length > 3 && (
                      <li>...and {children.length - 3} more</li>
                    )}
                  </ul>

                  <div className="pt-2">
                    <label className="block font-bold text-amber-950 mb-1">
                      Safely Reassign Reporting Sub-positions To:
                    </label>
                    <select
                      value={deleteReassignTo}
                      onChange={(e) => setDeleteReassignTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white text-neutral-800 focus:outline-none"
                    >
                      <option value="root">
                        Top Level (No Parent / Elevate to Apex)
                      </option>
                      {nodes
                        .filter((n) => n._id !== deleteTarget._id)
                        .map((n) => (
                          <option key={n._id} value={n._id}>
                            {n.name} ({n.designation})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          LIVE PUBLIC PREVIEW MODAL
      ========================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F8F5F0] rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-neutral-300 flex flex-col">
            <div className="p-4 sm:p-5 bg-white border-b border-neutral-200 flex items-center justify-between sticky top-0 z-20 rounded-t-3xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Public Website Preview
                </span>
                <h3 className="text-lg font-bold text-neutral-900 font-['Fraunces']">
                  Live Institutional Organogram
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-10">
              <OrganogramSection
                section={{
                  title: "Institutional Governance Framework",
                  subheading:
                    "Hierarchical structure and reporting framework of the institution.",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganogramManager;
