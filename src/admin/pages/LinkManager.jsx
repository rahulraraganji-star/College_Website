import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import MediaModal from "../media/pages/MediaModal";
import {
  Link2,
  FileCode,
  ArrowRight,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Edit2,
  Trash2,
  FileText,
  File,
  RotateCcw,
  Eye,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";

const API_URL = "/api";

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

const LinkManager = () => {
  const { hasPermission } = useAuth();

  const canView = hasPermission("link_manager.view");
  const canCreate = hasPermission("link_manager.create");
  const canEdit = hasPermission("link_manager.edit");
  const canDelete = hasPermission("link_manager.delete");

  // ==========================================
  // TAB STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState("redirects"); // 'redirects' | 'file_mappings'

  // ==========================================
  // REDIRECTS STATE
  // ==========================================
  const [redirects, setRedirects] = useState([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectSearch, setRedirectSearch] = useState("");
  const [redirectStatusFilter, setRedirectStatusFilter] = useState("all");
  const [redirectCodeFilter, setRedirectCodeFilter] = useState("all");
  const [redirectPage, setRedirectPage] = useState(1);
  const [redirectPagination, setRedirectPagination] = useState(null);

  // ==========================================
  // FILE MAPPINGS STATE
  // ==========================================
  const [fileMappings, setFileMappings] = useState([]);
  const [fileMappingsLoading, setFileMappingsLoading] = useState(true);
  const [fileMappingSearch, setFileMappingSearch] = useState("");
  const [fileMappingStatusFilter, setFileMappingStatusFilter] = useState("all");
  const [fileMappingPage, setFileMappingPage] = useState(1);
  const [fileMappingPagination, setFileMappingPagination] = useState(null);

  // ==========================================
  // MODALS STATE
  // ==========================================
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState(null);

  const [fileMappingModalOpen, setFileMappingModalOpen] = useState(false);
  const [editingFileMapping, setEditingFileMapping] = useState(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPathInput, setTestPathInput] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'redirect' | 'file_mapping'
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  // ==========================================
  // FETCH REDIRECTS
  // ==========================================
  const fetchRedirects = useCallback(async (opts = {}) => {
    setRedirectsLoading(true);
    try {
      const params = new URLSearchParams({
        page: opts.page ?? redirectPage,
        limit: 15,
        ...(redirectSearch && { q: redirectSearch }),
        ...(redirectStatusFilter !== "all" && { status: redirectStatusFilter }),
        ...(redirectCodeFilter !== "all" && { statusCode: redirectCodeFilter }),
      });

      const res = await fetch(`${API_URL}/link-manager/redirects?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load redirects.");
      }

      setRedirects(data.redirects || []);
      setRedirectPagination(data.pagination || null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRedirectsLoading(false);
    }
  }, [redirectPage, redirectSearch, redirectStatusFilter, redirectCodeFilter]);

  // ==========================================
  // FETCH FILE MAPPINGS
  // ==========================================
  const fetchFileMappings = useCallback(async (opts = {}) => {
    setFileMappingsLoading(true);
    try {
      const params = new URLSearchParams({
        page: opts.page ?? fileMappingPage,
        limit: 15,
        ...(fileMappingSearch && { q: fileMappingSearch }),
        ...(fileMappingStatusFilter !== "all" && { status: fileMappingStatusFilter }),
      });

      const res = await fetch(`${API_URL}/link-manager/file-mappings?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load file mappings.");
      }

      setFileMappings(data.fileMappings || []);
      setFileMappingPagination(data.pagination || null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFileMappingsLoading(false);
    }
  }, [fileMappingPage, fileMappingSearch, fileMappingStatusFilter]);

  useEffect(() => {
    if (activeTab === "redirects") {
      fetchRedirects({ page: 1 });
      setRedirectPage(1);
    } else {
      fetchFileMappings({ page: 1 });
      setFileMappingPage(1);
    }
  }, [
    activeTab,
    redirectSearch,
    redirectStatusFilter,
    redirectCodeFilter,
    fileMappingSearch,
    fileMappingStatusFilter,
  ]);

  // ==========================================
  // TOGGLE STATUS
  // ==========================================
  const handleToggleRedirectStatus = async (item) => {
    try {
      const res = await fetch(`${API_URL}/link-manager/redirects/${item._id}/status`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status.");
      }

      showToast(data.message);
      fetchRedirects();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleFileMappingStatus = async (item) => {
    try {
      const res = await fetch(`${API_URL}/link-manager/file-mappings/${item._id}/status`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status.");
      }

      showToast(data.message);
      fetchFileMappings();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ==========================================
  // DELETE HANDLER
  // ==========================================
  const handleDelete = async () => {
    if (!deleteTarget || !deleteType) return;
    setDeleting(true);

    try {
      const endpoint =
        deleteType === "redirect"
          ? `${API_URL}/link-manager/redirects/${deleteTarget._id}`
          : `${API_URL}/link-manager/file-mappings/${deleteTarget._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete item.");
      }

      showToast(data.message);
      setDeleteTarget(null);
      setDeleteType(null);

      if (deleteType === "redirect") {
        fetchRedirects();
      } else {
        fetchFileMappings();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // TEST RESOLVER HANDLER
  // ==========================================
  const runTestResolver = async (pathOverride) => {
    const pathToTest = pathOverride || testPathInput;
    if (!pathToTest) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch(`${API_URL}/link-manager/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path: pathToTest }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resolve path.");
      }

      setTestResult(data.resolution);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setTestLoading(false);
    }
  };

  const openTestModalForPath = (path) => {
    setTestPathInput(path);
    setTestModalOpen(true);
    runTestResolver(path);
  };

  return (
    <div
      className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 antialiased"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <Toast open={toast.open} type={toast.type} message={toast.message} />

      {/* ==========================================
          PAGE HEADER
      ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
              <Link2 size={22} />
            </div>
            <h1
              className="text-[28px] font-extrabold text-black tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Link Manager
            </h1>
          </div>
          <p className="text-neutral-500 text-[14px] mt-1.5">
            Manage legacy URLs, redirects, and old WordPress document links to preserve search rankings and bookmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTestPathInput("");
              setTestResult(null);
              setTestModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
          >
            <Play size={16} className="text-blue-600" />
            <span>Test URL Resolver</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "redirects") {
                  setEditingRedirect(null);
                  setRedirectModalOpen(true);
                } else {
                  setEditingFileMapping(null);
                  setFileMappingModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-neutral-800 transition shadow-md"
            >
              <Plus size={18} />
              <span>{activeTab === "redirects" ? "Add Redirect" : "Add File Mapping"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          NAVIGATION TABS
      ========================================== */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("redirects")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition ${
            activeTab === "redirects"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <ArrowRight size={17} className={activeTab === "redirects" ? "text-white" : "text-gray-400"} />
          <span>Page & URL Redirects</span>
          {redirectPagination?.total !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "redirects" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {redirectPagination.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("file_mappings")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition ${
            activeTab === "file_mappings"
              ? "bg-black text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <FileCode size={17} className={activeTab === "file_mappings" ? "text-white" : "text-gray-400"} />
          <span>Legacy File Mappings</span>
          {fileMappingPagination?.total !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "file_mappings" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {fileMappingPagination.total}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================
          TAB 1: REDIRECTS
      ========================================================= */}
      {activeTab === "redirects" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search source, destination, reason..."
                value={redirectSearch}
                onChange={(e) => setRedirectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={redirectStatusFilter}
                onChange={(e) => setRedirectStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={redirectCodeFilter}
                onChange={(e) => setRedirectCodeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
              >
                <option value="all">All Status Codes</option>
                <option value="301">301 — Permanent</option>
                <option value="302">302 — Temporary</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Old / Legacy URL</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-4 text-center">Code</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Hits</th>
                  <th className="py-4 px-4">Last Accessed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {redirectsLoading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading redirects...
                    </td>
                  </tr>
                ) : redirects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <div className="text-4xl mb-3">🔗</div>
                      <p className="text-lg font-medium text-gray-800">No redirects found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {redirectSearch ? "Try changing your search or filters." : "Create your first redirect mapping."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  redirects.map((item) => {
                    const isExternal = /^https?:\/\//i.test(item.destination);
                    return (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-blue-700 font-semibold max-w-[260px] truncate">
                          {item.sourcePath}
                          {item.description && (
                            <p className="font-sans text-[11.5px] text-gray-500 font-normal mt-0.5 truncate">
                              {item.description}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 font-mono text-xs text-gray-800 max-w-[260px]">
                          <div className="flex items-center gap-1.5 truncate">
                            {isExternal && <ExternalLink size={13} className="text-gray-400 flex-shrink-0" />}
                            <span className="truncate">{item.destination}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                              item.statusCode === 301 ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.statusCode}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleToggleRedirectStatus(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                              item.active ? STATUS_BADGE.active : STATUS_BADGE.inactive
                            } ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                            title={canEdit ? "Click to toggle active status" : undefined}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-green-600" : "bg-gray-400"}`} />
                            <span>{item.active ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-center font-mono text-xs text-gray-600 font-medium">
                          {item.hitCount || 0}
                        </td>

                        <td className="py-4 px-4 text-xs text-gray-500">
                          {item.lastResolvedAt ? new Date(item.lastResolvedAt).toLocaleDateString() : "Never"}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTestModalForPath(item.sourcePath)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Test Resolution"
                            >
                              <Play size={16} />
                            </button>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRedirect(item);
                                  setRedirectModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(item);
                                  setDeleteType("redirect");
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {redirectPagination && redirectPagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing page {redirectPagination.page} of {redirectPagination.totalPages} ({redirectPagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={redirectPage <= 1}
                  onClick={() => setRedirectPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={redirectPage >= redirectPagination.totalPages}
                  onClick={() => setRedirectPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: LEGACY FILE MAPPINGS
      ========================================================= */}
      {activeTab === "file_mappings" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search legacy file path, doc name..."
                value={fileMappingSearch}
                onChange={(e) => setFileMappingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={fileMappingStatusFilter}
                onChange={(e) => setFileMappingStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Legacy File URL (WordPress Path)</th>
                  <th className="py-4 px-6">Mapped Document</th>
                  <th className="py-4 px-6">Actual File URL</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Hits</th>
                  <th className="py-4 px-4">Last Accessed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {fileMappingsLoading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading file mappings...
                    </td>
                  </tr>
                ) : fileMappings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-500">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-lg font-medium text-gray-800">No legacy file mappings found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {fileMappingSearch
                          ? "Try changing your search or filters."
                          : "Create a mapping for old WordPress PDF/doc URLs."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  fileMappings.map((item) => {
                    const doc = item.documentId;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-purple-800 font-semibold max-w-[260px] truncate">
                          {item.legacyPath}
                          {item.description && (
                            <p className="font-sans text-[11.5px] text-gray-500 font-normal mt-0.5 truncate">
                              {item.description}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 max-w-[220px]">
                          {doc ? (
                            <div className="flex items-center gap-2.5">
                              <FileText size={20} className="text-red-500 flex-shrink-0" />
                              <div className="truncate">
                                <p className="font-medium text-xs text-gray-900 truncate">
                                  {doc.originalName || doc.filename}
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono">
                                  {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : ""}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                              <AlertTriangle size={14} />
                              Document Missing
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 font-mono text-xs text-gray-600 max-w-[220px] truncate">
                          {doc?.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{doc.url}</span>
                              <ArrowUpRight size={13} className="flex-shrink-0" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleToggleFileMappingStatus(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                              item.active ? STATUS_BADGE.active : STATUS_BADGE.inactive
                            } ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                            title={canEdit ? "Click to toggle active status" : undefined}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-green-600" : "bg-gray-400"}`} />
                            <span>{item.active ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-center font-mono text-xs text-gray-600 font-medium">
                          {item.hitCount || 0}
                        </td>

                        <td className="py-4 px-4 text-xs text-gray-500">
                          {item.lastResolvedAt ? new Date(item.lastResolvedAt).toLocaleDateString() : "Never"}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTestModalForPath(item.legacyPath)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Test Resolution"
                            >
                              <Play size={16} />
                            </button>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFileMapping(item);
                                  setFileMappingModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(item);
                                  setDeleteType("file_mapping");
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {fileMappingPagination && fileMappingPagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing page {fileMappingPagination.page} of {fileMappingPagination.totalPages} (
                {fileMappingPagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={fileMappingPage <= 1}
                  onClick={() => setFileMappingPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={fileMappingPage >= fileMappingPagination.totalPages}
                  onClick={() => setFileMappingPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL 1: ADD / EDIT REDIRECT
      ========================================================= */}
      {redirectModalOpen && (
        <RedirectModal
          redirect={editingRedirect}
          onClose={() => {
            setRedirectModalOpen(false);
            setEditingRedirect(null);
          }}
          onSuccess={(msg) => {
            showToast(msg);
            setRedirectModalOpen(false);
            setEditingRedirect(null);
            fetchRedirects();
          }}
        />
      )}

      {/* =========================================================
          MODAL 2: ADD / EDIT FILE MAPPING
      ========================================================= */}
      {fileMappingModalOpen && (
        <FileMappingModal
          fileMapping={editingFileMapping}
          onClose={() => {
            setFileMappingModalOpen(false);
            setEditingFileMapping(null);
          }}
          onOpenMediaPicker={() => setMediaPickerOpen(true)}
          onSuccess={(msg) => {
            showToast(msg);
            setFileMappingModalOpen(false);
            setEditingFileMapping(null);
            fetchFileMappings();
          }}
        />
      )}

      {/* MEDIA LIBRARY PICKER MODAL */}
      {mediaPickerOpen && (
        <MediaModal
          isOpen={mediaPickerOpen}
          type="document"
          multiple={false}
          title="Select Document for Legacy Link Mapping"
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(selected) => {
            const item = Array.isArray(selected) ? selected[0] : selected;
            if (item) {
              window.dispatchEvent(
                new CustomEvent("linkManager:mediaSelected", { detail: item })
              );
            }
            setMediaPickerOpen(false);
          }}
        />
      )}

      {/* =========================================================
          MODAL 3: TEST RESOLVER
      ========================================================= */}
      {testModalOpen && (
        <TestResolverModal
          testPath={testPathInput}
          setTestPath={setTestPathInput}
          result={testResult}
          loading={testLoading}
          onRunTest={() => runTestResolver()}
          onClose={() => {
            setTestModalOpen(false);
            setTestResult(null);
          }}
        />
      )}

      {/* =========================================================
          MODAL 4: CONFIRM DELETE
      ========================================================= */}
      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title={deleteType === "redirect" ? "Delete Redirect" : "Delete File Mapping"}
          message={
            deleteType === "redirect"
              ? `Are you sure you want to delete the redirect for "${deleteTarget.sourcePath}"? Requests to this old URL will no longer be redirected.`
              : `Are you sure you want to delete the file mapping for "${deleteTarget.legacyPath}"? \n\nIMPORTANT: The actual document file will NOT be deleted from the media library. Only the legacy link mapping will be removed.`
          }
          confirmText="Delete Mapping"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteType(null);
          }}
        />
      )}
    </div>
  );
};

/* ==========================================================
   SUB-COMPONENT: REDIRECT MODAL
========================================================== */
const RedirectModal = ({ redirect, onClose, onSuccess }) => {
  const isEdit = Boolean(redirect);

  const [sourcePath, setSourcePath] = useState(redirect?.sourcePath || "");
  const [destType, setDestType] = useState(
    /^https?:\/\//i.test(redirect?.destination || "") ? "external" : "internal"
  );
  const [destination, setDestination] = useState(redirect?.destination || "");
  const [statusCode, setStatusCode] = useState(redirect?.statusCode || 301);
  const [active, setActive] = useState(redirect?.active ?? true);
  const [description, setDescription] = useState(redirect?.description || "");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!sourcePath.trim()) {
      setFormError("Old / Legacy URL is required.");
      return;
    }

    if (!destination.trim()) {
      setFormError("Destination URL is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        sourcePath: sourcePath.trim(),
        destination: destination.trim(),
        statusCode: Number(statusCode),
        active,
        description: description.trim(),
      };

      const url = isEdit
        ? `${API_URL}/link-manager/redirects/${redirect._id}`
        : `${API_URL}/link-manager/redirects`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save redirect.");
      }

      onSuccess(data.message);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
              {isEdit ? "Edit Redirect" : "Add New Redirect"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Forward an old WordPress or legacy URL to a new page or external link.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Source Path */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Old / Legacy URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="/academics/computer-science/"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                className="w-full font-mono text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
              />
            </div>
            <p className="text-[11.5px] text-gray-500 mt-1">
              Enter the old URL users may have bookmarked or that may already exist inside legacy documents. Full URLs and local paths are supported.
            </p>
          </div>

          {/* Destination Type & Destination */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Destination <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDestType("internal");
                    if (/^https?:\/\//i.test(destination)) setDestination("/");
                  }}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                    destType === "internal" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Website Page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDestType("external");
                    if (!/^https?:\/\//i.test(destination)) setDestination("https://");
                  }}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                    destType === "external" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  External URL
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder={destType === "internal" ? "/departments/computer-science" : "https://naac.gov.in"}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full font-mono text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
          </div>

          {/* Redirect Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Redirect Type
              </label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
              >
                <option value={301}>301 — Permanent (Recommended)</option>
                <option value={302}>302 — Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={active ? "true" : "false"}
                onChange={(e) => setActive(e.target.value === "true")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
              >
                <option value="true">Active (Resolves)</option>
                <option value="false">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Renamed department page after 2024 syllabus revision"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : isEdit ? "Update Redirect" : "Create Redirect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   SUB-COMPONENT: FILE MAPPING MODAL
========================================================== */
const FileMappingModal = ({ fileMapping, onClose, onOpenMediaPicker, onSuccess }) => {
  const isEdit = Boolean(fileMapping);

  const [legacyPath, setLegacyPath] = useState(fileMapping?.legacyPath || "");
  const [selectedDoc, setSelectedDoc] = useState(fileMapping?.documentId || null);
  const [active, setActive] = useState(fileMapping?.active ?? true);
  const [description, setDescription] = useState(fileMapping?.description || "");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Listen for media selection from MediaModal
  useEffect(() => {
    const handleMediaSelection = (e) => {
      if (e.detail) {
        setSelectedDoc(e.detail);
      }
    };

    window.addEventListener("linkManager:mediaSelected", handleMediaSelection);
    return () => {
      window.removeEventListener("linkManager:mediaSelected", handleMediaSelection);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!legacyPath.trim()) {
      setFormError("Old / Legacy File URL is required.");
      return;
    }

    if (!selectedDoc || !selectedDoc._id) {
      setFormError("Please select an existing document from the Media Library.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        legacyPath: legacyPath.trim(),
        documentId: selectedDoc._id,
        active,
        description: description.trim(),
      };

      const url = isEdit
        ? `${API_URL}/link-manager/file-mappings/${fileMapping._id}`
        : `${API_URL}/link-manager/file-mappings`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save file mapping.");
      }

      onSuccess(data.message);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
              {isEdit ? "Edit Legacy File Mapping" : "Add Legacy File Mapping"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Map an old WordPress document path (e.g. /wp-content/uploads/...) to a file in the Media Library.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Legacy File URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Old / Legacy File URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="/wp-content/uploads/2023/11/AQAR-2023.pdf"
              value={legacyPath}
              onChange={(e) => setLegacyPath(e.target.value)}
              className="w-full font-mono text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
            <p className="text-[11.5px] text-gray-500 mt-1">
              Enter the old WordPress document URL/path exactly as referenced by existing PDFs, bookmarks, or other documents.
            </p>
          </div>

          {/* Selected Document Reference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Target Document in Media Library <span className="text-red-500">*</span>
            </label>
            <p className="text-[11.5px] text-gray-500 mb-2">
              Select the existing PDF/document in your Media Library that should be served when the legacy URL is requested.
            </p>

            {selectedDoc ? (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoc.originalName || selectedDoc.filename}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {selectedDoc.url} {selectedDoc.size ? `• ${(selectedDoc.size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenMediaPicker}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 text-gray-600"
              >
                <FileText size={32} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-800">Select Document from Media Library</span>
                <span className="text-xs text-gray-400">Choose from existing Media Library files (no re-upload needed).</span>
              </button>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={active ? "true" : "false"}
              onChange={(e) => setActive(e.target.value === "true")}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
            >
              <option value="true">Active (Resolves legacy URL to file)</option>
              <option value="false">Inactive (Disabled)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. NAAC AQAR 2023 report referenced inside main accreditation prospectus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : isEdit ? "Update Mapping" : "Create Mapping"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================
   SUB-COMPONENT: TEST RESOLVER MODAL
========================================================== */
const TestResolverModal = ({ testPath, setTestPath, result, loading, onRunTest, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Play size={20} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
              Test URL Resolver
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Enter Path to Test
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. /wp-content/uploads/2023/11/AQAR.pdf or /academics/admission/"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onRunTest()}
                className="flex-1 font-mono text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
              />
              <button
                type="button"
                disabled={loading || !testPath.trim()}
                onClick={onRunTest}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Resolving..." : "Test"}
              </button>
            </div>
            <p className="text-[11.5px] text-gray-400 mt-1">
              Simulates how the server and frontend will resolve an incoming URL request from a PDF or browser.
            </p>
          </div>

          {/* RESULT CARD */}
          {result && (
            <div className="mt-4 border border-gray-200 rounded-xl p-5 bg-gray-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Resolution Result</span>
                {result.found && result.valid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={13} />
                    Resolved Successfully
                  </span>
                ) : result.inactiveMatch ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle size={13} />
                    Inactive Mapping Found
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">
                    <XCircle size={13} />
                    Not Found (404)
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">Tested Normalized Path:</span>
                  <span className="font-mono font-semibold text-gray-800">{result.normalizedPath}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">Resolution Type:</span>
                  <span className="font-semibold capitalize text-gray-800">{result.type.replace("_", " ")}</span>
                </div>

                {result.type === "redirect" && result.found && (
                  <>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Status Code:</span>
                      <span className="font-bold text-purple-700">{result.statusCode} (Redirect)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-mono text-blue-600 font-semibold">{result.destination}</span>
                    </div>
                  </>
                )}

                {result.type === "file" && result.found && (
                  <>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Resolved Document:</span>
                      <span className="font-semibold text-gray-800">{result.originalName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">MIME Type:</span>
                      <span className="font-mono text-gray-700">{result.mimeType || "application/pdf"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Physical File URL:</span>
                      <span className="font-mono text-blue-600 truncate max-w-[280px]">{result.fileUrl}</span>
                    </div>
                  </>
                )}

                {result.inactiveMatch && (
                  <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs">
                    {result.message}
                  </p>
                )}
              </div>

              {result.found && result.valid && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={result.type === "file" ? result.fileUrl : result.destination}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    <span>Open Target Destination</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkManager;
