import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ==========================================
     GET CURRENT USER
  ========================================== */

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();

      if (!data.success) {
        setUser(null);
        return null;
      }

      setUser(data.user);

      return data.user;

    } catch (error) {
      console.error(
        "FETCH CURRENT USER ERROR:",
        error
      );

      setUser(null);

      return null;
    }
  };


  /* ==========================================
     LOGIN
  ========================================== */

  const login = async (
    email,
    password
  ) => {
    const response = await fetch(
      `${API_URL}/auth/login`,
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
        data.message ||
        "Login failed."
      );
    }

    /*
     * Login response contains basic user
     * information. Fetch /me immediately
     * so we also receive role permissions
     * and allowed page scopes.
     */

    await fetchCurrentUser();

    return data;
  };


  /* ==========================================
     LOGOUT
  ========================================== */

  const logout = async () => {
    try {
      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setUser(null);
    }
  };


  /* ==========================================
     INITIAL AUTH CHECK
  ========================================== */

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchCurrentUser();

      setLoading(false);
    };

    initializeAuth();
  }, []);


  /* ==========================================
     PERMISSION HELPERS
  ========================================== */

  const hasPermission = (
    permission
  ) => {
    if (!user) {
      return false;
    }

    return (
      user.permissions?.includes(
        permission
      ) || false
    );
  };


  const hasAnyPermission = (
    permissions = []
  ) => {
    if (!user) {
      return false;
    }

    return permissions.some(
      (permission) =>
        user.permissions?.includes(
          permission
        )
    );
  };


  const hasAllPermissions = (
    permissions = []
  ) => {
    if (!user) {
      return false;
    }

    return permissions.every(
      (permission) =>
        user.permissions?.includes(
          permission
        )
    );
  };


  const hasPageAccess = (
    pageSlug
  ) => {
    if (!user) {
      return false;
    }

    const allowedPages =
      user.allowedPages || [];

    if (
      allowedPages.includes("*")
    ) {
      return true;
    }

    return allowedPages.includes(
      pageSlug
    );
  };


  /* ==========================================
     CONTEXT
  ========================================== */

  const value = {
    user,
    loading,

    login,
    logout,
    fetchCurrentUser,

    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPageAccess,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


/* ==========================================
   HOOK
========================================== */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};