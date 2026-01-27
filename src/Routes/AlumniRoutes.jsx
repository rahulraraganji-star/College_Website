import { Routes, Route, Navigate } from "react-router-dom";
import AlumniLayout from "../Layouts/AlumniLayout";

import AboutAlumni from "../Pages/Alumni/AboutAlumni";
import Registration from "../Pages/Alumni/Registration";
import ExecutiveCouncil from "../Pages/Alumni/ExecutiveCouncil";
import Activities from "../Pages/Alumni/Activities";

const AlumniRoutes = () => {
  return (
    <Routes>
      <Route element={<AlumniLayout />}>

        {/* Default redirect */}
        <Route index element={<Navigate to="about" replace />} />

        <Route path="about" element={<AboutAlumni />} />
        <Route path="registration" element={<Registration />} />
        <Route path="executive-council" element={<ExecutiveCouncil />} />
        <Route path="activities" element={<Activities />} />

      </Route>
    </Routes>
  );
};

export default AlumniRoutes;
