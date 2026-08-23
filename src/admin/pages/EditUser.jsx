import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateRoleModal from "../components/CreateRoleModal";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:5000/api";

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // logged-in user

  // ==========================================
  // DATA
  // ==========================================

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // ==========================================
  // FORM
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load user.");
        }

        const u = data.user;
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");
        setDepartment(u.department || "");
        setStatus(u.status || "active");
        setSelectedRoleId(u.roleId?._id || u.roleId || "");
        setSelectedRole(u.roleId || null);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    fetch_();
  }, [userId]);

  // ==========================================
  // LOAD ROLES
  // ==========================================

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch(`${API_URL}/roles`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setRoles(
          (data.roles || []).filter(
            (r) => !r.isSystemRole || r.systemRole === "admin"
          )
        );
      }
    } catch (err) {
      console.error("LOAD ROLES ERROR:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);


  // ==========================================
  // ROLE SELECTION
  // ==========================================

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    setShowPermissions(false);
    const role = roles.find((r) => r._id === roleId) || null;
    setSelectedRole(role);
  };

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
    setSuccess(false);

    if (!name.trim()) return setError("Name is required.");
    if (!email.trim()) return setError("Email is required.");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department: department.trim() || null,
          status,
          roleId: selectedRoleId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update user.");
      }

      setSuccess(true);
      setTimeout(() => navigate("/admin/users"), 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOADING / ERROR STATES
  // ==========================================

  if (loadingUser) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <p className="text-sm text-gray-400">Loading user...</p>
      </div>
    );
  }

  if (!user && error) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // isProtected = true only when a NON-super_admin is trying to edit a super_admin account.
  // Super Admin can edit anyone (including other super admins and themselves).
  const isProtected =
    user?.role === "super_admin" &&
    currentUser?.role !== "super_admin";


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[800px] mx-auto px-6 lg:px-8 py-8">

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
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Edit User
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {user.name} · {user.email}
        </p>
      </div>


      {isProtected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠ This is a protected system account. Some fields may be restricted.
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          User updated. Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-5">

        {/* USER DETAILS */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">User Information</h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField label="Full Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                disabled={isProtected}
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={isProtected}
              />
            </FormField>

            <FormField label="Department">
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
                disabled={isProtected}
              />
            </FormField>

            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
                disabled={isProtected}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>

          </div>
        </div>


        {/* ROLE */}
        {!isProtected && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">Access & Role</h2>
            </div>

            <div className="p-5 space-y-4">

              <FormField label="Role">
                {loadingRoles ? (
                  <p className="text-sm text-gray-400">Loading roles...</p>
                ) : (
                  <select
                    value={selectedRoleId}
                    onChange={(e) => handleRoleSelect(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">No role assigned</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <p className="text-sm text-gray-500">
                Don't see the role you need?{" "}
                <button
                  type="button"
                  onClick={() => setShowCreateRole(true)}
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
                >
                  + Create New Role
                </button>
              </p>

              {selectedRole && (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPermissions((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {selectedRole.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {showPermissions ? "Hide ▲" : "View permissions ▼"}
                    </span>
                  </button>

                  {showPermissions && (
                    <div className="px-4 py-4 space-y-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                          Pages
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedRole.allowedPages || []).map((pg) => (
                            <span
                              key={pg}
                              className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                            >
                              <span className="text-green-500">✓</span> {pg}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                          Permissions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedRole.permissions || []).map((perm) => (
                            <span
                              key={perm}
                              className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}


        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || success || isProtected}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>


      {showCreateRole && (
        <CreateRoleModal
          onSuccess={handleRoleCreated}
          onClose={() => setShowCreateRole(false)}
        />
      )}

    </div>
  );
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400";

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default EditUser;
