import { Routes, Route, Navigate } from "react-router-dom";
import ExaminationLayout from "../layouts/ExaminationLayout";

import Committee from "../Pages/Examination/Committee";
import Ordinances from "../Pages/Examination/Ordinances";
import Schedule from "../Pages/Examination/Schedule";
import Notices from "../Pages/Examination/Notices";

const ExaminationRoutes = () => {
  return (
    <Routes>
      <Route element={<ExaminationLayout />}>

        <Route index element={<Navigate to="committee" replace />} />

        <Route path="committee" element={<Committee />} />
        <Route path="ordinances" element={<Ordinances />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="notices" element={<Notices />} />

      </Route>
    </Routes>
  );
};

export default ExaminationRoutes;
