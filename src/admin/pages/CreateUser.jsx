import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoleModal from "../components/CreateRoleModal";

const API_URL = "http://localhost:5000/api";

const CreateUser = () => {
  const navigate = useNavigate();

  // ==========================================
  // USER DETAILS
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");

  // ==========================================
  // ROLE SELECTION
  // ==========================================

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  // ==========================================
  // LOAD ROLES
  // ==========================================

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch(`${API_URL}/roles`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error("LOAD ROLES ERROR:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);


  // ==========================================
  // ROLE SELECTION HANDLER
  // ==========================================

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    setShowPermissions(false);
    const role = roles.find((r) => r._id === roleId) || null;
    setSelectedRole(role);
  };


  // ==========================================
  // AFTER CREATE ROLE MODAL SAVES
  // Auto-selects the newly created role and
  // returns the user to this form.
  // ==========================================

  const handleRoleCreated = (newRole) => {
    setRoles((prev) => [newRole, ...prev]);
    setSelectedRoleId(newRole._id);
    setSelectedRole(newRole);
    setShowCreateRole(false);
    setShowPermissions(false);
  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim())       return setError("Name is required.");
    if (!email.trim())      return setError("Email is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (!selectedRoleId)    return setError("Please select a role.");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          department: department.trim() || null,
          roleId: selectedRoleId,
          status: "active",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create user.");

      setSuccess(true);
      setTimeout(() => navigate("/admin/users"), 1200);

    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[800px] mx-auto px-6 lg:px-8 py-8">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="text-xs text-gray-400 hover:text-gray-700 mb-3 flex items-center gap-1"
        >
          ← Users
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Users & Access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Create User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a CMS user and assign them a role.
        </p>
      </div>


      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ User created successfully. Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ====================================
            SECTION 1 — USER INFORMATION
        ==================================== */}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <SectionHeader
            title="User Information"
            subtitle="Basic account details for this user."
          />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField label="Full Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Library Department"
                className={inputClass}
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="library@college.edu"
                className={inputClass}
              />
            </FormField>

            <FormField label="Department">
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Library"
                className={inputClass}
              />
            </FormField>

            <FormField label="Password" required>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={inputClass}
              />
            </FormField>

          </div>
        </div>


        {/* ====================================
            SECTION 2 — ACCESS & ROLE
        ==================================== */}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <SectionHeader
            title="Access & Role"
            subtitle="The role defines what pages and actions this user can access."
          />

          <div className="p-5 space-y-4">

            {/* ROLE DROPDOWN */}
            <FormField label="Role" required>
              {loadingRoles ? (
                <p className="text-sm text-gray-400">Loading roles...</p>
              ) : (
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a role...</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                      {role.isSystemRole ? " (System)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </FormField>


            {/* CREATE NEW ROLE INLINE LINK */}
            <p className="text-sm text-gray-500">
              Don't see the role you need?{" "}
              <button
                type="button"
                onClick={() => setShowCreateRole(true)}
                className="font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600"
              >
                + Create New Role
              </button>
            </p>


            {/* VIEW ROLE PERMISSIONS PANEL */}
            {selectedRole && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">

                {/* Collapsible header */}
                <button
                  type="button"
                  onClick={() => setShowPermissions((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedRole.name}
                    </span>
                    <span className="rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                      ✓ Selected
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {showPermissions ? "Hide permissions ▲" : "View permissions ▼"}
                  </span>
                </button>

                {/* Permissions detail */}
                {showPermissions && (
                  <div className="px-4 py-4 space-y-4 border-t border-gray-100">

                    {/* Page access */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
                        Pages
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedRole.allowedPages || []).length === 0 ? (
                          <span className="text-xs text-gray-400">No pages assigned</span>
                        ) : (
                          selectedRole.allowedPages.map((pg) => (
                            <span
                              key={pg}
                              className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                            >
                              <span className="text-green-500">✓</span> {pg}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
                        Permissions ({(selectedRole.permissions || []).length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedRole.permissions || []).length === 0 ? (
                          <span className="text-xs text-gray-400">No permissions assigned</span>
                        ) : (
                          selectedRole.permissions.map((perm) => (
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

                    {/* Approval workflow notice */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-700">Changes</p>
                      <p className="mt-0.5 text-xs text-amber-600">
                        All content changes by this user will require Admin approval before going live.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>


        {/* ====================================
            FORM ACTIONS
        ==================================== */}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || success}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User →"}
          </button>
        </div>

      </form>


      {/* ====================================
          CREATE ROLE MODAL
          Opens when "+ Create New Role" is clicked.
          onSuccess auto-selects the new role and
          closes the modal, returning to this form.
      ==================================== */}

      {showCreateRole && (
        <CreateRoleModal
          onSuccess={handleRoleCreated}
          onClose={() => setShowCreateRole(false)}
        />
      )}

    </div>
  );
};


/* ==========================================
   SUB-COMPONENTS
========================================== */

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

const SectionHeader = ({ title, subtitle }) => (
  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
    <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
  </div>
);

export default CreateUser;