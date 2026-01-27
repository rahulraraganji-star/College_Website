import { Routes, Route } from "react-router-dom";
import AcademicsLayout from "../Layouts/AcademicsLayout";

import Academics from "../Pages/Academics/Academics";
import Programmes from "../Pages/Academics/Programmes";
import CertificateCourses from "../Pages/Academics/CertificateCourses";
import SkillCourses from "../Pages/Academics/SkillCourses";
import Timetable from "../Pages/Academics/Timetable";
import AcademicCalendar from "../Pages/Academics/AcademicCalendar";
import Research from "../Pages/Academics/Research";
import ProgrammeRoutes from "./ProgrammeRoutes";

const AcademicsRoutes = () => {
  return (
    <Routes>
      {/* ALL academics pages use the SAME layout */}
      <Route element={<AcademicsLayout />}>

        {/* OVERVIEW */}
        <Route index element={<Academics />} />

        {/* PROGRAMMES OVERVIEW */}
        <Route path="programmes" element={<Programmes />} />

        {/* PROGRAMME DETAILS (BA / BCOM / BCA / future) */}
        <Route path=":programme/*" element={<ProgrammeRoutes />} />

        {/* OTHER ACADEMICS PAGES */}
        <Route path="certificate-courses" element={<CertificateCourses />} />
        <Route path="skill-courses" element={<SkillCourses />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="calendar" element={<AcademicCalendar />} />
        <Route path="research" element={<Research />} />

      </Route>
    </Routes>
  );
};

export default AcademicsRoutes;
