import { Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import HomePageEditor from "../pages/HomePageEditor";
import Pages from "../pages/Pages";
import NavigationManager from "../pages/NavigationManager";
import Media from "../pages/Media";
import CreatePage from "../pages/CreatePage";
import EditPage from "../pages/EditPage";

const AdminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="home" element={<HomePageEditor />} />
    <Route path="pages" element={<Pages />} />
    <Route path="navigation" element={<NavigationManager  />} />
    <Route path="media" element={<Media />} />
    <Route path="pages/create" element={<CreatePage />} />
<Route path="pages/:id" element={<EditPage />} />



  </Route>
);

export default AdminRoutes;