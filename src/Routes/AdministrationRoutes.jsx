import { Routes, Route } from "react-router-dom";
import AdministrationLayout from "../layouts/AdministrationLayout";
import Administration from "../Pages/Administration/Administration";
import Organogram from "../Pages/Administration/Organogram";
import Committees from "../Pages/Administration/Committees";
import Notices from "../Pages/Administration/Notices";

const AdministrationRoutes = () => {
  return (
    <Routes>
      <Route element={<AdministrationLayout />}>
        <Route index element={<Administration />} />
        <Route path="organogram" element={<Organogram />} />
        <Route path="committees" element={<Committees />} />
        <Route path="notices" element={<Notices />} />
      </Route>
    </Routes>
  );
};

export default AdministrationRoutes;
