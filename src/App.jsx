import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Navbar from "./Components/NavBar";
import Hero from "./Components/Hero_Section";
import ScrollingText from "./Components/ScrollingText";
import LearningSpacesCarousel from "./Components/LearningSpacesCarousel";
import Events_Section from "./Components/Events_Section";
import CoreStrengths from "./Components/CoreStrengths";
import Footer from "./Components/Footer";

/* layouts */
import AboutLayout from "./Layouts/AboutLayout";
import AdministrationLayout from "./Layouts/AdministrationLayout";
import StudentLifeLayout from "./Layouts/StudentLifeLayout";
import AcademicsLayout from "./Layouts/AcademicsLayout";
import StaffLayout from "./Layouts/StaffLayout";
import AdmissionsLayout from "./Layouts/AdmissionsLayout";
import ExaminationLayout from "./Layouts/ExaminationLayout";
import AccreditationLayout from "./Layouts/AccreditationLayout";
import RTILayout from "./Layouts/RTILayout";
import AlumniLayout from "./Layouts/AlumniLayout";
import InfrastructureLayout from "./Layouts/InfrastructureLayout";
import IqacLayout from "./Layouts/IqacLayout";

/* dynamic page */
import DynamicPage from "./Pages/DynamicPage";

function App() {
  return (
    <>
      <Header />
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <ScrollingText />
              <LearningSpacesCarousel />
              <Events_Section />
              <CoreStrengths />
            </>
          }
        />

        {/* ABOUT */}
        <Route path="about" element={<AboutLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* ADMINISTRATION */}
        <Route path="administration" element={<AdministrationLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* STUDENT LIFE */}
        <Route path="student-life" element={<StudentLifeLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* ACADEMICS */}
        <Route path="academics" element={<AcademicsLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* STAFF */}
        <Route path="staff" element={<StaffLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* ADMISSIONS */}
        <Route path="admissions" element={<AdmissionsLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* EXAMINATION */}
        <Route path="examination" element={<ExaminationLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* ACCREDITATION */}
        <Route path="accreditation" element={<AccreditationLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* RTI */}
        <Route path="rti" element={<RTILayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* ALUMNI */}
        <Route path="alumni" element={<AlumniLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* INFRASTRUCTURE */}
        <Route path="infrastructure" element={<InfrastructureLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>

        {/* IQAC */}
        <Route path="iqac" element={<IqacLayout />}>
          <Route path=":slug" element={<DynamicPage />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}

export default App;
