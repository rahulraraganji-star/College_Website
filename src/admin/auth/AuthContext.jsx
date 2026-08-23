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
        "http://localhost:5000/api/auth/me",
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
      "http://localhost:5000/api/auth/login",
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

    setUser(data.user);

    return data;
  };

  const logout = async () => {
    try {
      await fetch(
        "http://localhost:5000/api/auth/logout",
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
    if (!user) {
      return false;
    }

    const permissions = user.permissions || [];

    // Super Admin / wildcard access
    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions = []) => {
    if (!user) {
      return false;
    }

    const userPermissions = user.permissions || [];

    // Wildcard = everything
    if (userPermissions.includes("*")) {
      return true;
    }

    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissions = []) => {
    if (!user) {
      return false;
    }

    const userPermissions = user.permissions || [];

    // Wildcard = everything
    if (userPermissions.includes("*")) {
      return true;
    }

    return permissions.every((permission) =>
      userPermissions.includes(permission)
    );
  };

  const hasPageAccess = (pageSlug) => {
    if (!user) {
      return false;
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