import { Routes, Route } from "react-router-dom";
import StaffLayout from "../Layouts/StaffLayout";
import FacultyPage from "../Pages/FacultyPage";

const StaffRoutes = () => {
  return (
    <Routes>

      <Route path="/staff" element={<StaffLayout />}>

        <Route
          path=":type"
          element={<FacultyPage />}
        />

      </Route>

    </Routes>
  );
};

export default StaffRoutes;