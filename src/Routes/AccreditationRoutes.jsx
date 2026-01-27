import { Routes, Route, Navigate } from "react-router-dom";
import AccreditationLayout from "../Layouts/AccreditationLayout";

import IQAC from "../Pages/Accreditation/IQAC";
import NAAC from "../Pages/Accreditation/NAAC";
import NIRF from "../Pages/Accreditation/NIRF";
import AISHE from "../Pages/Accreditation/AISHE";
import IndiaToday from "../Pages/Accreditation/IndiaToday";

const AccreditationRoutes = () => {
  return (
    <Routes>
      <Route element={<AccreditationLayout />}>

        {/* Default page */}
        <Route index element={<Navigate to="iqac" replace />} />

        <Route path="iqac" element={<IQAC />} />
        <Route path="naac" element={<NAAC />} />
        <Route path="nirf" element={<NIRF />} />
        <Route path="aishe" element={<AISHE />} />
        <Route path="india-today" element={<IndiaToday />} />

      </Route>
    </Routes>
  );
};

export default AccreditationRoutes;
