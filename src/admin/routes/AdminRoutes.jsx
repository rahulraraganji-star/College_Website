import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoadingScreen from "../../Components/LoadingScreen";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const WorkspaceDashboard = lazy(() => import("../pages/WorkspaceDashboard"));
const HomePageEditor = lazy(() => import("../pages/HomePageEditor"));
const Pages = lazy(() => import("../pages/Pages"));
const NavigationManager = lazy(() => import("../pages/NavigationManager"));
const Media = lazy(() => import("../pages/Media"));
const LinkManager = lazy(() => import("../pages/LinkManager"));
const OrganogramManager = lazy(() => import("../pages/OrganogramManager"));
const HeaderManager = lazy(() => import("../pages/HeaderManager"));
const FooterManager = lazy(() => import("../pages/FooterManager"));
const CreatePage = lazy(() => import("../pages/CreatePage"));
const EditPage = lazy(() => import("../pages/EditPage"));

const Users = lazy(() => import("../pages/Users"));
const CreateUser = lazy(() => import("../pages/CreateUser"));
const EditUser = lazy(() => import("../pages/EditUser"));

const Roles = lazy(() => import("../pages/Roles"));
const EditRole = lazy(() => import("../pages/EditRole"));

const Approvals = lazy(() => import("../pages/Approvals"));
const AuditLogs = lazy(() => import("../pages/AuditLogs"));
const Account = lazy(() => import("../pages/Account"));

const Login = lazy(() => import("../pages/Login"));

const AdminRoutes = (
  <>
    {/* ==========================================
        ADMIN LOGIN
    ========================================== */}

    <Route
      path="/admin/login"
      element={
        <Suspense fallback={<LoadingScreen fullScreen={true} text="Loading admin..." />}>
          <Login />
        </Suspense>
      }
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

        {/* MY ACCOUNT / PROFILE / PASSWORD (All authenticated users) */}
        <Route
          path="account"
          element={<Account />}
        />

        {/* CONTENT */}
        <Route element={<ProtectedRoute anyPermission={["pages.view", "pages.edit"]} />}>
          <Route
            path="home"
            element={<HomePageEditor />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["pages.view", "pages.edit", "pages.create", "pages.delete"]} />}>
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

        <Route element={<ProtectedRoute anyPermission={["pages.view", "pages.edit"]} />}>
          <Route
            path="pages/:id"
            element={<EditPage />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["navigation.view", "navigation.edit"]} />}>
          <Route
            path="navigation"
            element={<NavigationManager />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["media.view", "media.upload", "media.edit", "media.delete"]} />}>
          <Route
            path="media"
            element={<Media />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["organogram.view", "organogram.create", "organogram.edit", "organogram.delete"]} />}>
          <Route
            path="organogram"
            element={<OrganogramManager />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["link_manager.view", "link_manager.create", "link_manager.edit", "link_manager.delete"]} />}>
          <Route
            path="link-manager"
            element={<LinkManager />}
          />
        </Route>

        {/* WEBSITE */}
        <Route element={<ProtectedRoute anyPermission={["settings.view", "settings.edit"]} />}>
          <Route
            path="header"
            element={<HeaderManager />}
          />
        </Route>

        <Route element={<ProtectedRoute anyPermission={["settings.view", "settings.edit"]} />}>
          <Route
            path="footer"
            element={<FooterManager />}
          />
        </Route>

        {/* USERS & ACCESS */}
        <Route element={<ProtectedRoute anyPermission={["users.view", "users.edit", "users.create", "users.delete"]} />}>
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

        <Route element={<ProtectedRoute anyPermission={["roles.view", "roles.edit", "roles.create", "roles.delete"]} />}>
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
        <Route element={<ProtectedRoute anyPermission={["approvals.view", "approvals.approve", "approvals.reject", "approvals.submit"]} />}>
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