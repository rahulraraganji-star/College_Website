import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const STEPS = ["Details", "Page Access", "Permissions", "Review"];

/* ==========================================
   HELPER — auto-generate slug from name
========================================== */

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");


/* ==========================================
   CREATE ROLE MODAL
   Props:
     onSuccess(newRole) — called after save
     onClose()          — cancel/close
========================================== */

const CreateRoleModal = ({ onSuccess, onClose }) => {

  // ==========================================
  // FORM STATE
  // ==========================================

  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");

  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // ==========================================
  // ACCESS DATA (dynamic from DB)
  // ==========================================

  const [scopes, setScopes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);

  // Which groups are expanded in the page tree
  const [expandedGroups, setExpandedGroups] = useState({});

  // ==========================================
  // SUBMIT STATE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD SCOPES + PERMISSIONS FROM DB
  // ==========================================

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/access`, {
          credentials: "include",
        });
        const data = await res.json();

      if (data.success) {
          setScopes(data.scopes || []);
          setGroups(data.groups || []);
          setPermissionGroups(data.permissions || []);
          // Auto-expand Home group by default
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

    load();
  }, []);


  // ==========================================
  // AUTO SLUG
  // ==========================================

  const handleNameChange = (value) => {
    setName(value);
    if (!slugManual) {
      setSlug(toSlug(value));
    }
  };


  // ==========================================
  // TOGGLE HELPERS
  // ==========================================

  const togglePage = (key) => {
    setSelectedPages((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  const toggleGroupAll = (group) => {
    const keys = group.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !keys.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev.filter((p) => !keys.includes(p)),
        ...keys,
      ]);
    }
  };

  // Toggle all children of a page group (for checkboxes)
  const togglePageGroup = (group) => {
    const childKeys = group.children.map((c) => c.key);
    const allSelected = childKeys.every((k) => selectedPages.includes(k));
    if (allSelected) {
      setSelectedPages((prev) => prev.filter((k) => !childKeys.includes(k)));
    } else {
      setSelectedPages((prev) => [
        ...prev.filter((k) => !childKeys.includes(k)),
        ...childKeys,
      ]);
    }
  };

  const toggleGroupExpand = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };


  // ==========================================
  // STEP VALIDATION
  // ==========================================

  const validateStep = () => {
    setError("");

    if (step === 0) {
      if (!name.trim()) {
        setError("Role name is required.");
        return false;
      }
      if (!slug.trim()) {
        setError("Role slug is required.");
        return false;
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        setError("Slug may only contain lowercase letters, numbers, and hyphens.");
        return false;
      }
    }

    if (step === 1 && selectedPages.length === 0) {
      setError("Select at least one page scope.");
      return false;
    }

    if (step === 2 && selectedPermissions.length === 0) {
      setError("Select at least one permission.");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setError("");
    setStep((s) => s - 1);
  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: "POST",
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create role.");
      }

      onSuccess(data.role);

    } catch (err) {
      console.error("CREATE ROLE ERROR:", err);
      setError(err.message || "Failed to create role.");
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
              Roles
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Create New Role
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>


        {/* ======================================
            STEP INDICATOR
        ====================================== */}

        <div className="flex items-center gap-0 px-6 pt-5 pb-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-0 flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-colors",
                    i < step
                      ? "bg-gray-900 text-white"
                      : i === step
                      ? "bg-gray-900 text-white ring-2 ring-offset-2 ring-gray-900"
                      : "bg-gray-100 text-gray-400",
                  ].join(" ")}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={[
                    "mt-1 text-[10px] font-medium whitespace-nowrap",
                    i === step ? "text-gray-900" : "text-gray-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "h-px flex-1 mx-2 mb-4",
                    i < step ? "bg-gray-900" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </div>
          ))}
        </div>


        {/* ======================================
            BODY
        ====================================== */}

        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* ====================================
              STEP 0 — DETAILS
          ==================================== */}

          {step === 0 && (
            <div className="space-y-4">

              <FieldLabel label="Role Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Library Editor"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </FieldLabel>

              <FieldLabel label="Slug" hint="Auto-generated · editable">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="library-editor"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono text-gray-700 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </FieldLabel>

              <FieldLabel label="Description" hint="Optional">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Can view and edit library pages."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                />
              </FieldLabel>

            </div>
          )}


          {/* ====================================
              STEP 1 — PAGE ACCESS
          ==================================== */}

          {step === 1 && (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Choose which pages and sections this role can access. Click a menu to expand its pages.
              </p>

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

                        {/* GROUP HEADER — click to expand */}
                        <div
                          className={[
                            "flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors",
                            isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50",
                          ].join(" ")}
                          onClick={() => toggleGroupExpand(group.key)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Select-all checkbox for this group */}
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => { if (el) el.indeterminate = someSelected; }}
                              onChange={(e) => {
                                e.stopPropagation();
                                togglePageGroup(group);
                              }}
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
                          <span className={[
                            "text-gray-400 text-xs transition-transform",
                            isExpanded ? "rotate-180" : "",
                          ].join(" ")}>
                            ▼
                          </span>
                        </div>

                        {/* CHILDREN — shown when expanded */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 divide-y divide-gray-50">
                            {group.children.length === 0 ? (
                              <p className="px-4 py-3 text-xs text-gray-400">No pages inside this section.</p>
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
          )}


          {/* ====================================
              STEP 2 — PERMISSIONS
          ==================================== */}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Select what actions this role can perform.
              </p>

              {loadingAccess ? (
                <p className="text-sm text-gray-400">Loading permissions...</p>
              ) : (
                permissionGroups
                  // Exclude 'audit' from role builder — only assignable to system roles
                  .filter((g) => g.key !== "audit")
                  .map((group) => {
                    const keys = group.permissions.map((p) => p.key);
                    const allSelected = keys.every((k) =>
                      selectedPermissions.includes(k)
                    );

                    return (
                      <div key={group.key} className="rounded-xl border border-gray-200 overflow-hidden">
                        {/* Group header */}
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

                        {/* Permissions */}
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
          )}


          {/* ====================================
              STEP 3 — REVIEW
          ==================================== */}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">

                <ReviewRow label="Name" value={name} />
                <ReviewRow label="Slug" value={slug} mono />
                {description && (
                  <ReviewRow label="Description" value={description} />
                )}

                <div className="px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                    Page Access
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPages.length === 0 ? (
                      <span className="text-sm text-gray-400">None selected</span>
                    ) : (
                      selectedPages.map((key) => {
                        const scope = scopes.find((s) => s.key === key);
                        return (
                          <span
                            key={key}
                            className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                          >
                            {scope?.label || key}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                    Permissions ({selectedPermissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPermissions.length === 0 ? (
                      <span className="text-sm text-gray-400">None selected</span>
                    ) : (
                      selectedPermissions.map((perm) => (
                        <span
                          key={perm}
                          className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white"
                        >
                          {perm}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-amber-50">
                  <p className="text-xs font-medium text-amber-700">
                    ⚠ Changes by users in this role require Admin approval.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>


        {/* ======================================
            FOOTER ACTIONS
        ====================================== */}

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={step === 0 ? onClose : prevStep}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Role"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


/* ==========================================
   SUB-COMPONENTS
========================================== */

const FieldLabel = ({ label, hint, required, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && (
        <span className="text-xs text-gray-400">{hint}</span>
      )}
    </div>
    {children}
  </div>
);

const ReviewRow = ({ label, value, mono }) => (
  <div className="flex items-start gap-4 px-4 py-3">
    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 w-24 pt-0.5 flex-shrink-0">
      {label}
    </span>
    <span className={["text-sm text-gray-900", mono ? "font-mono" : ""].join(" ")}>
      {value}
    </span>
  </div>
);


export default CreateRoleModal;
