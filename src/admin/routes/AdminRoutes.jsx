import { Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Dashboard";
import HomePageEditor from "../pages/HomePageEditor";
import Pages from "../pages/Pages";
import NavigationManager from "../pages/NavigationManager";
import Media from "../pages/Media";
import CreatePage from "../pages/CreatePage";
import EditPage from "../pages/EditPage";
import Users from "../pages/Users";
import CreateUser from "../pages/CreateUser";
import Login from "../pages/Login";

import ProtectedRoute from "../auth/ProtectedRoute";

const AdminRoutes = (
  <>
    {/* ==========================================
        ADMIN LOGIN
    ========================================== */}

    <Route
      path="/admin/login"
      element={<Login />}
    />

    {/* ==========================================
        PROTECTED ADMIN PANEL
    ========================================== */}

    <Route element={<ProtectedRoute />}>
      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="home"
          element={<HomePageEditor />}
        />

        <Route
          path="pages"
          element={<Pages />}
        />

        <Route
          path="navigation"
          element={<NavigationManager />}
        />

        <Route
          path="media"
          element={<Media />}
        />

        <Route
  path="users"
  element={<Users />}
/>

<Route
  path="users/create"
  element={<CreateUser />}
/>

        <Route
          path="pages/create"
          element={<CreatePage />}
        />

        <Route
          path="pages/:id"
          element={<EditPage />}
        />
      </Route>
    </Route>
  </>
);

export default AdminRoutes;