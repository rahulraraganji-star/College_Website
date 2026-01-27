import { Routes, Route } from "react-router-dom";
import AdmissionsLayout from "../Layouts/AdmissionsLayout";

import Admissions from "../Pages/Admissions/Admissions";
import Prospectus from "../Pages/Admissions/Prospectus";
import Documents from "../Pages/Admissions/Documents";
import MeritList from "../Pages/Admissions/MeritList";
import Notices from "../Pages/Admissions/Notices";
import RefundPolicy from "../Pages/Admissions/RefundPolicy";

const AdmissionsRoutes = () => {
  return (
    <Routes>
      <Route element={<AdmissionsLayout />}>
        <Route index element={<Admissions />} />
        <Route path="prospectus" element={<Prospectus />} />
        <Route path="documents" element={<Documents />} />
        <Route path="merit-list" element={<MeritList />} />
        <Route path="notices" element={<Notices />} />
        <Route path="refund-policy" element={<RefundPolicy />} />
      </Route>
    </Routes>
  );
};

export default AdmissionsRoutes;
