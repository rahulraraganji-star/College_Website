import { Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Dashboard";
import WorkspaceDashboard from "../pages/WorkspaceDashboard";
import HomePageEditor from "../pages/HomePageEditor";
import Pages from "../pages/Pages";
import NavigationManager from "../pages/NavigationManager";
import Media from "../pages/Media";
import CreatePage from "../pages/CreatePage";
import EditPage from "../pages/EditPage";

import Users from "../pages/Users";
import CreateUser from "../pages/CreateUser";
import EditUser from "../pages/EditUser";

import Roles from "../pages/Roles";
import EditRole from "../pages/EditRole";

import Approvals from "../pages/Approvals";
import AuditLogs from "../pages/AuditLogs";

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
        Outer guard: must be authenticated.
        Inner guards: per-route permission checks.
    ========================================== */}

    <Route element={<ProtectedRoute />}>
      <Route
        path="/admin"
        element={<AdminLayout />}
      >

        {/* DASHBOARD — admins and super admins only */}
        <Route element={<ProtectedRoute roles={["super_admin", "admin"]} />}>
          <Route
            index
            element={<Dashboard />}
          />
        </Route>

        {/* WORKSPACE — dept editors see this instead of dashboard */}
        <Route
          path="workspace"
          element={<WorkspaceDashboard />}
        />

        {/* CONTENT */}
        <Route element={<ProtectedRoute permission="pages.edit" />}>
          <Route
            path="home"
            element={<HomePageEditor />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="pages.view" />}>
          <Route
            path="pages"
            element={<Pages />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="pages.create" />}>
          <Route
            path="pages/create"
            element={<CreatePage />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="pages.view" />}>
          <Route
            path="pages/:id"
            element={<EditPage />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="navigation.view" />}>
          <Route
            path="navigation"
            element={<NavigationManager />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="media.view" />}>
          <Route
            path="media"
            element={<Media />}
          />
        </Route>

        {/* USERS & ACCESS */}
        <Route element={<ProtectedRoute permission="users.view" />}>
          <Route
            path="users"
            element={<Users />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="users.create" />}>
          <Route
            path="users/create"
            element={<CreateUser />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="users.edit" />}>
          <Route
            path="users/:userId"
            element={<EditUser />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="roles.view" />}>
          <Route
            path="roles"
            element={<Roles />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="roles.edit" />}>
          <Route
            path="roles/:id"
            element={<EditRole />}
          />
        </Route>

        {/* WORKFLOWS */}
        <Route element={<ProtectedRoute permission="approvals.view" />}>
          <Route
            path="approvals"
            element={<Approvals />}
          />
        </Route>

        <Route element={<ProtectedRoute permission="audit.view" />}>
          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />
        </Route>

      </Route>
    </Route>
  </>
);

export default AdminRoutes;