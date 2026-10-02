import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingScreen from "../../Components/LoadingScreen";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute />                        — any authenticated user
 *   <ProtectedRoute permission="users.view" /> — requires specific permission
 *   <ProtectedRoute anyPermission={["pages.view", "pages.edit"]} /> — requires at least one of the permissions
 *   <ProtectedRoute roles={["super_admin","admin"]} /> — requires system role
 */
const ProtectedRoute = ({ permission = null, anyPermission = null, roles = null }) => {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Still checking authentication
  if (loading) {
    return <LoadingScreen text="Checking authentication..." />;
  }

  // Not authenticated → login
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // System role check
  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />;
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  // Any permission check
  if (anyPermission && Array.isArray(anyPermission) && anyPermission.length > 0) {
    if (!hasAnyPermission(anyPermission)) {
      return <AccessDenied />;
    }
  }

  return <Outlet />;
};

// ==========================================
// ACCESS DENIED COMPONENT
// ==========================================

export const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          You don't have permission to access this page.
          {user && (
            <span className="block mt-1 text-gray-400">
              Signed in as <strong>{user.name}</strong> ({user.role})
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;