import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;