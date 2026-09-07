import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("AUTH CHECK ERROR:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Login failed."
      );
    }

    /*
     * Call /auth/me immediately to load the full
     * user object after the cookie is set.
     */
    await checkAuth();

    return data;
  };

  const logout = async () => {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      setUser(null);
    }
  };

  // ==========================================
  // PERMISSION HELPERS
  // ==========================================

  const hasPermission = (permission) => {
    if (!user || !permission) {
      return false;
    }

    if (user.role === "super_admin") {
      return true;
    }

    const permissions = user.permissions || [];

    // Super Admin / wildcard access
    if (permissions.includes("*")) {
      return true;
    }

    if (permissions.includes(permission)) {
      return true;
    }

    // Permission hierarchy: edit/create/delete/upload implies view
    if (permission.endsWith(".view")) {
      const modulePrefix = permission.split(".")[0] + ".";
      return permissions.some((p) => p.startsWith(modulePrefix));
    }

    return false;
  };

  const hasAnyPermission = (permissionList = []) => {
    if (!user) {
      return false;
    }

    if (user.role === "super_admin") {
      return true;
    }

    const userPermissions = user.permissions || [];

    // Wildcard = everything
    if (userPermissions.includes("*")) {
      return true;
    }

    return permissionList.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissionList = []) => {
    if (!user) {
      return false;
    }

    if (user.role === "super_admin") {
      return true;
    }

    const userPermissions = user.permissions || [];

    // Wildcard = everything
    if (userPermissions.includes("*")) {
      return true;
    }

    return permissionList.every((perm) => hasPermission(perm));
  };

  const hasPageAccess = (pageSlug) => {
    if (!user) {
      return false;
    }

    if (user.role === "super_admin") {
      return true;
    }

    const allowedPages = user.allowedPages || [];

    // Wildcard = access to all pages
    if (allowedPages.includes("*")) {
      return true;
    }

    return allowedPages.includes(pageSlug);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasPageAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};