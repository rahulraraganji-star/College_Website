import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoleModal from "../components/CreateRoleModal";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = "http://localhost:5000/api";

const Roles = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);


  // ==========================================
  // FETCH ROLES
  // ==========================================

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/roles`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load roles.");
      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);


  // ==========================================
  // AFTER ROLE CREATED
  // ==========================================

  const handleRoleCreated = (newRole) => {
    setRoles((prev) => [newRole, ...prev]);
    setShowCreateRole(false);
  };


  // ==========================================
  // DELETE ROLE (soft delete via PATCH isActive=false)
  // ==========================================

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/roles/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete role.");
      }

      setDeleteTarget(null);
      fetchRoles();

    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
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
            Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Reusable access profiles. Assign roles to users to control what they can do.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateRole(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
        >
          + Create Role
        </button>
      </div>


      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* ROLES TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading roles...
          </div>
        ) : roles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No roles found.</p>
            <button
              type="button"
              onClick={() => setShowCreateRole(true)}
              className="mt-3 text-sm text-gray-900 font-medium underline underline-offset-2"
            >
              Create your first role
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Page Access
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Permissions
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role._id} className="hover:bg-gray-50 transition-colors">

                  {/* NAME + DESCRIPTION */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{role.name}</p>
                      {role.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* SLUG */}
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {role.slug}
                  </td>

                  {/* PAGE ACCESS */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(role.allowedPages || []).length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        role.allowedPages.slice(0, 3).map((pg) => (
                          <span
                            key={pg}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {pg}
                          </span>
                        ))
                      )}
                      {(role.allowedPages || []).length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{role.allowedPages.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PERMISSIONS COUNT */}
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {(role.permissions || []).length} permission
                    {(role.permissions || []).length !== 1 ? "s" : ""}
                  </td>

                  {/* TYPE BADGE */}
                  <td className="px-4 py-3">
                    {role.isSystemRole ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        System
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
                        Custom
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/roles/${role._id}`)}
                        disabled={role.isSystemRole}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>

                      {!role.isSystemRole && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(role)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>


      {/* CREATE ROLE MODAL */}
      {showCreateRole && (
        <CreateRoleModal
          onSuccess={handleRoleCreated}
          onClose={() => setShowCreateRole(false)}
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Role"
          message={`Are you sure you want to delete "${deleteTarget.name}"? Users assigned this role will lose their access profile.`}
          confirmLabel={deleting ? "Deleting..." : "Delete Role"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  );
};

export default Roles;
