import { Routes, Route } from "react-router-dom";
import StudentLifeLayout from "../layouts/StudentLifeLayout";
import StudentLife from "../Pages/StudentLife/StudentLife";
import Support from "../Pages/StudentLife/Support";
import Clubs from "../Pages/StudentLife/Clubs";
import Council from "../Pages/StudentLife/Council";
import NCC from "../Pages/StudentLife/NCC";
import NSS from "../Pages/StudentLife/NSS";
import Sports from "../Pages/StudentLife/Sports";
import Placements from "../Pages/StudentLife/Placements";
import Counselling from "../Pages/StudentLife/Counselling";
import Awards from "../Pages/StudentLife/Awards";

const StudentLifeRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLifeLayout />}>
        <Route index element={<StudentLife />} />
        <Route path="support" element={<Support />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="council" element={<Council />} />
        <Route path="ncc" element={<NCC />} />
        <Route path="nss" element={<NSS />} />
        <Route path="sports" element={<Sports />} />
        <Route path="placements" element={<Placements />} />
        <Route path="counselling" element={<Counselling />} />
        <Route path="awards" element={<Awards />} />
      </Route>
    </Routes>
  );
};

export default StudentLifeRoutes;
