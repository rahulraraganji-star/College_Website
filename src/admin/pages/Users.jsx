import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../auth/AuthContext";

const API_URL = "/api";

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  suspended: "bg-amber-100 text-amber-700",
  deleted: "bg-red-100 text-red-600",
};

const Users = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reset Password Modal State
  const [resetTarget, setResetTarget] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async (opts = {}) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: opts.page ?? page,
        limit: 20,
        ...(search && { q: search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`${API_URL}/users?${params}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(data.users || []);
      setPagination(data.pagination || null);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({ page: 1 });
    setPage(1);
  }, [search, roleFilter, statusFilter]);


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `${API_URL}/users/${deleteTarget._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user.");
      }

      setDeleteTarget(null);
      setSuccessMsg(`User ${deleteTarget.name} has been deactivated.`);
      fetchUsers();

    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;

    setResetting(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/users/${resetTarget._id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newPassword: newPasswordInput.trim() || undefined }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setResetResult(data.temporaryPassword);
      setSuccessMsg(`Password for ${resetTarget.name} was reset successfully.`);

    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Users & Access
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold text-black tracking-tight">
            Users
          </h1>
          <p className="mt-1.5 text-[14px] text-neutral-500">
            Manage CMS users, assign authorized roles, and reset credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/users/create")}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          + Create User
        </button>
      </div>


      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="department_editor">Department Editor</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>

        {(search || roleFilter || statusFilter !== "active") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setStatusFilter("active");
            }}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>


      {/* NOTIFICATIONS */}
      {successMsg && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-900">✕</button>
        </div>
      )}


      {/* TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No users found.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((targetUser) => {
                  const isTargetSuper =
                    targetUser.role === "super_admin" ||
                    targetUser.roleId?.systemRole === "super_admin" ||
                    targetUser.roleId?.slug === "super-admin";

                  const isTargetAdmin =
                    targetUser.role === "admin" ||
                    targetUser.roleId?.systemRole === "admin" ||
                    targetUser.roleId?.slug === "admin";

                  const isActorSuper = currentUser?.role === "super_admin";
                  const isSelf = targetUser._id === (currentUser?.id || currentUser?._id);

                  // Super Admin can edit/reset anyone. Admin can only edit/reset non-super-admin and non-admin custom users.
                  const canEdit = isActorSuper || (!isTargetSuper && !isTargetAdmin);
                  const canDelete = !isSelf && !isTargetSuper && (isActorSuper || !isTargetAdmin);
                  const canReset = isActorSuper || (!isTargetSuper && !isTargetAdmin);

                  return (
                    <tr
                      key={targetUser._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* NAME */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                            {targetUser.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {targetUser.name}
                          </span>
                          {isTargetSuper && (
                            <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Super Admin
                            </span>
                          )}
                          {isTargetAdmin && !isTargetSuper && (
                            <span className="rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {targetUser.email}
                      </td>

                      {/* ROLE */}
                      <td className="px-4 py-3">
                        {targetUser.roleId ? (
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {targetUser.roleId.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 capitalize">
                            {targetUser.role?.replace("_", " ")}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            STATUS_BADGE[targetUser.status] || STATUS_BADGE.inactive,
                          ].join(" ")}
                        >
                          {targetUser.status}
                        </span>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-4 py-3 text-gray-500">
                        {targetUser.department || "—"}
                      </td>

                      {/* CREATED */}
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(targetUser.createdAt).toLocaleDateString()}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {canReset && (
                            <button
                              type="button"
                              onClick={() => {
                                setResetTarget(targetUser);
                                setNewPasswordInput("");
                                setResetResult(null);
                              }}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Reset Password"
                            >
                              Reset Pass
                            </button>
                          )}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/users/${targetUser._id}`)
                              }
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(targetUser)}
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>


            {/* PAGINATION */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">
                  {pagination.total} user{pagination.total !== 1 ? "s" : ""}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const prev = page - 1;
                      setPage(prev);
                      fetchUsers({ page: prev });
                    }}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-gray-500">
                    {page} / {pagination.pages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= pagination.pages}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchUsers({ page: next });
                    }}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>


      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title="Deactivate User"
          message={`Are you sure you want to deactivate "${deleteTarget.name}"? Their active sessions will be terminated.`}
          confirmText="Deactivate"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* RESET PASSWORD MODAL */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Reset Password for {resetTarget.name}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Set a custom password or leave blank to automatically generate a secure temporary password.
            </p>

            {resetResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">
                    Temporary Password Generated:
                  </p>
                  <p className="text-sm font-mono font-bold text-emerald-950 bg-white p-2.5 rounded border border-emerald-200 select-all">
                    {resetResult}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    Please copy this password and securely transmit it to the user.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetTarget(null);
                      setResetResult(null);
                    }}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Custom Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetTarget(null);
                      setNewPasswordInput("");
                    }}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black disabled:opacity-50"
                  >
                    {resetting ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;