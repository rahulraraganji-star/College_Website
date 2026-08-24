import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = "http://localhost:5000/api";

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  deleted: "bg-red-100 text-red-600",
};

const Users = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      fetchUsers();

    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Users & Access
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage CMS users and their role-based access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/users/create")}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
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


      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">

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
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isProtected =
                    user.role === "super_admin" ||
                    (user.role === "admin" && user.isSystemRole);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* NAME */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.name}
                          </span>
                          {isProtected && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Protected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-3 text-gray-500">
                        {user.email}
                      </td>

                      {/* ROLE */}
                      <td className="px-4 py-3">
                        {user.roleId ? (
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {user.roleId.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            STATUS_BADGE[user.status] || STATUS_BADGE.inactive,
                          ].join(" ")}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-4 py-3 text-gray-500">
                        {user.department || "—"}
                      </td>

                      {/* CREATED */}
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/users/${user._id}`)
                            }
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          {!isProtected && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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
          title="Delete User"
          message={`Are you sure you want to deactivate "${deleteTarget.name}"? They will lose all CMS access.`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  );
};

export default Users;