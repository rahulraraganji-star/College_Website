import { Routes, Route, Navigate } from "react-router-dom";
import ProgrammeLayout from "../layouts/ProgrammeLayout";

import Subjects from "../Pages/Academics/Programmes/Subjects";
import Syllabus from "../Pages/Academics/Programmes/Syllabus";
import Outcomes from "../Pages/Academics/Programmes/Outcomes";

const ProgrammeRoutes = () => {
  return (
    <Routes>
      <Route element={<ProgrammeLayout />}>
        
        {/* DEFAULT TAB */}
        <Route index element={<Navigate to="subjects" replace />} />

        <Route path="subjects" element={<Subjects />} />
        <Route path="syllabus" element={<Syllabus />} />
        <Route path="outcomes" element={<Outcomes />} />

      </Route>
    </Routes>
  );
};

export default ProgrammeRoutes;
