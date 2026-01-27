import { Routes, Route, Navigate } from "react-router-dom";
import InfrastructureLayout from "../Layouts/InfrastructureLayout";

import Facilities from "../Pages/Infrastructure/Facilities";
import Library from "../Pages/Infrastructure/Library";
import VirtualTour from "../Pages/Infrastructure/VirtualTour";

const InfrastructureRoutes = () => {
  return (
    <Routes>
      <Route element={<InfrastructureLayout />}>

        {/* Default redirect */}
        <Route index element={<Navigate to="facilities" replace />} />

        <Route path="facilities" element={<Facilities />} />
        <Route path="library" element={<Library />} />
        <Route path="virtual-tour" element={<VirtualTour />} />

      </Route>
    </Routes>
  );
};

export default InfrastructureRoutes;
