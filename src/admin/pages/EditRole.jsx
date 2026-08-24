import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const toSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // DATA
  // ==========================================

  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [scopes, setScopes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  // ==========================================
  // FORM
  // ==========================================

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  // ==========================================
  // LOAD ROLE
  // ==========================================

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/roles/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load role.");

        const r = data.role;
        setRole(r);
        setName(r.name || "");
        setSlug(r.slug || "");
        setDescription(r.description || "");
        setSelectedPages(r.allowedPages || []);
        setSelectedPermissions(r.permissions || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRole(false);
      }
    };

    fetch_();
  }, [id]);


  // ==========================================
  // LOAD ACCESS DEFINITIONS
  // ==========================================

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/access`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setScopes(data.scopes || []);
          setGroups(data.groups || []);
          setPermissionGroups(data.permissions || []);
          if (data.groups?.length > 0) {
            setExpandedGroups({ home: true });
          }
        }
      } catch (err) {
        console.error("LOAD ACCESS ERROR:", err);
      } finally {
        setLoadingAccess(false);
      }
    };

    fetch_();
  }, []);


  // ==========================================
  // TOGGLES
  // ==========================================

  const togglePage = (key) =>
    setSelectedPages((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const togglePermission = (perm) =>
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );

  const toggleGroupAll = (group) => {
    const keys = group.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));
    setSelectedPermissions((prev) =>
      allSelected
        ? prev.filter((p) => !keys.includes(p))
        : [...prev.filter((p) => !keys.includes(p)), ...keys]
    );
  };

  const togglePageGroup = (group) => {
    const childKeys = group.children.map((c) => c.key);
    const allSelected = childKeys.every((k) => selectedPages.includes(k));
    if (allSelected) {
      setSelectedPages((prev) => prev.filter((k) => !childKeys.includes(k)));
    } else {
      setSelectedPages((prev) => [...prev.filter((k) => !childKeys.includes(k)), ...childKeys]);
    }
  };

  const toggleGroupExpand = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) return setError("Role name is required.");
    if (!slug.trim()) return setError("Role slug is required.");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
          allowedPages: selectedPages,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update role.");

      setSuccess(true);
      setTimeout(() => navigate("/admin/roles"), 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // STATES
  // ==========================================

  if (loadingRole) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <p className="text-sm text-gray-400">Loading role...</p>
      </div>
    );
  }

  if (!role && error) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (role?.isSystemRole) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/admin/roles")}
          className="text-xs text-gray-400 hover:text-gray-700 mb-3 flex items-center gap-1"
        >
          ← Roles
        </button>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">System Role — Read Only</p>
          <p className="mt-1 text-sm text-amber-700">
            The "{role.name}" role is a system role and cannot be modified.
          </p>
        </div>
      </div>
    );
  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-8">

      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/roles")}
          className="text-xs text-gray-400 hover:text-gray-700 mb-3 flex items-center gap-1"
        >
          ← Roles
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Users & Access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Edit Role
        </h1>
        <p className="mt-1 text-sm text-gray-500">{role.name}</p>
      </div>

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Role updated. Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-5">

        {/* DETAILS */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Role Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <FormField label="Role Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Slug">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass + " font-mono"}
              />
            </FormField>
            <FormField label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass + " resize-none"}
              />
            </FormField>
          </div>
        </div>


        {/* PAGE ACCESS */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Page Access</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Click a menu to expand and select specific pages.
            </p>
          </div>
          <div className="p-5">
            {loadingAccess ? (
              <p className="text-sm text-gray-400">Loading pages...</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-gray-400">No published pages found.</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => {
                  const isExpanded = expandedGroups[group.key];
                  const childKeys = group.children.map((c) => c.key);
                  const selectedCount = childKeys.filter((k) => selectedPages.includes(k)).length;
                  const allSelected = childKeys.length > 0 && selectedCount === childKeys.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={group.key} className="rounded-xl border border-gray-200 overflow-hidden">

                      {/* GROUP HEADER */}
                      <div
                        className={[
                          "flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors",
                          isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50",
                        ].join(" ")}
                        onClick={() => toggleGroupExpand(group.key)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected; }}
                            onChange={(e) => { e.stopPropagation(); togglePageGroup(group); }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {group.label}
                            </span>
                            {selectedCount > 0 && (
                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                {selectedCount} selected
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={["text-gray-400 text-xs", isExpanded ? "rotate-180" : ""].join(" ")}>
                          ▼
                        </span>
                      </div>

                      {/* CHILDREN */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                          {group.children.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-gray-400">No pages inside.</p>
                          ) : (
                            group.children.map((child) => {
                              const selected = selectedPages.includes(child.key);
                              return (
                                <label
                                  key={child.key}
                                  className={[
                                    "flex items-center gap-3 px-6 py-2.5 cursor-pointer transition-colors",
                                    selected ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50 text-gray-700",
                                  ].join(" ")}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => togglePage(child.key)}
                                    className="h-3.5 w-3.5 rounded"
                                  />
                                  <span className="text-sm">{child.label}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        {/* PERMISSIONS */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Permissions</h2>
          </div>
          <div className="p-5 space-y-4">
            {loadingAccess ? (
              <p className="text-sm text-gray-400">Loading permissions...</p>
            ) : (
              permissionGroups
                .filter((g) => g.key !== "audit")
                .map((group) => {
                  const keys = group.permissions.map((p) => p.key);
                  const allSelected = keys.every((k) => selectedPermissions.includes(k));
                  return (
                    <div key={group.key} className="rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                          {group.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroupAll(group)}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          {allSelected ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 p-4">
                        {group.permissions.map((perm) => {
                          const active = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={[
                                "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm transition-colors",
                                active
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300",
                              ].join(" ")}
                            >
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => togglePermission(perm.key)}
                                className="sr-only"
                              />
                              {perm.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>


        {/* ACTIONS */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/roles")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Role"}
          </button>
        </div>

      </form>
    </div>
  );
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default EditRole;
