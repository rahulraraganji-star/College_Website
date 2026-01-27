import { Routes, Route, Navigate } from "react-router-dom";
import RTILayout from "../Layouts/RTILayout";

import Reservation from "../Pages/RTI/Reservation";
import Divyangjan from "../Pages/RTI/Divyangjan";
import UniversityStatutes from "../Pages/RTI/UniversityStatutes";
import InstitutionalInfo from "../Pages/RTI/InstitutionalInfo";
import OtherDisclosure from "../Pages/RTI/OtherDisclosure";

const RTIRoutes = () => {
  return (
    <Routes>
      <Route element={<RTILayout />}>

        {/* Default page */}
        <Route
          index
          element={<Navigate to="reservation-admission-recruitment" replace />}
        />

        <Route
          path="reservation-admission-recruitment"
          element={<Reservation />}
        />
        <Route path="divyangjan-policy" element={<Divyangjan />} />
        <Route path="university-statutes" element={<UniversityStatutes />} />
        <Route
          path="institutional-information"
          element={<InstitutionalInfo />}
        />
        <Route path="other-disclosure" element={<OtherDisclosure />} />

      </Route>
    </Routes>
  );
};

export default RTIRoutes;
