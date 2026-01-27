import { Routes, Route } from "react-router-dom";
import StaffLayout from "../Layouts/StaffLayout";

import Staff from "../Pages/Staff/Staff";
import TeachingFaculty from "../Pages/Staff/TeachingFaculty";
import NonTeachingStaff from "../Pages/Staff/NonTeachingStaff";

const StaffRoutes = () => {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route index element={<Staff />} />
        <Route path="faculty" element={<TeachingFaculty />} />
        <Route path="non-teaching" element={<NonTeachingStaff />} />
      </Route>
    </Routes>
  );
};

export default StaffRoutes;
