import { Routes, Route } from "react-router-dom";
import IqacLayout from "../Layouts/IqacLayout";
import Iqac from "../Pages/Iqac/Iqac";

const IqacRoutes = () => {
  return (
    <Routes>
      <Route element={<IqacLayout />}>
        <Route index element={<Iqac />} />
      </Route>
    </Routes>
  );
};

export default IqacRoutes;
