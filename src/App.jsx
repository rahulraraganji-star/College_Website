import { Routes, Route, Navigate } from "react-router-dom";

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

/* dynamic */
import DynamicPage from "./Pages/DynamicPage";
import DynamicLayout from "./Layouts/DynamicLayout";


function App() {
  return (
    <>
      <Header />
      <Navbar />

      <Routes>
        {/* ================= HOME ================= */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <ScrollingText />
              <LearningSpacesCarousel />
              <Events_Section />
              <CoreStrengths />


              {/*
              
             
              
             
              
              */}
            </>
          }
        />

        {/* ================= ABOUT ================= */}
        <Route path="about" element={<AboutLayout />}>
          <Route index element={<Navigate to="history" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= ADMINISTRATION ================= */}
        <Route path="administration" element={<AdministrationLayout />}>
          <Route index element={<Navigate to="organogram" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= STUDENT LIFE ================= */}
        <Route path="student-life" element={<StudentLifeLayout />}>
          <Route index element={<Navigate to="support" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= ACADEMICS ================= */}
        <Route path="academics" element={<AcademicsLayout />}>
          <Route index element={<Navigate to="programmes" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= STAFF ================= */}
       <Route path="staff" element={<StaffLayout />}>
  <Route index element={<Navigate to="faculty" replace />} />
  <Route element={<DynamicLayout />}>
    <Route path=":slug" element={<DynamicPage />} />
  </Route>
</Route>
        {/* ================= ADMISSIONS ================= */}
        <Route path="admissions" element={<AdmissionsLayout />}>
          <Route index element={<Navigate to="prospectus" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= EXAMINATION ================= */}
        <Route path="examination" element={<ExaminationLayout />}>
          <Route index element={<Navigate to="examination-committee" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= ACCREDITATION ================= */}
        <Route path="accreditation" element={<AccreditationLayout />}>
          <Route index element={<Navigate to="iqac" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= RTI / POLICIES ================= */}
        <Route path="rti" element={<RTILayout />}>
          <Route index element={<Navigate to="reservation-admission-recruitment" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= ALUMNI ================= */}
        <Route path="alumni" element={<AlumniLayout />}>
          <Route index element={<Navigate to="about" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= INFRASTRUCTURE ================= */}
        <Route path="infrastructure" element={<InfrastructureLayout />}>
          <Route index element={<Navigate to="facilities" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= IQAC ================= */}
        <Route path="iqac" element={<IqacLayout />}>
          <Route index element={<Navigate to="about" replace />} />
          <Route element={<DynamicLayout />}>
            <Route path=":slug" element={<DynamicPage />} />
          </Route>
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<div>404 – Page Not Found</div>} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
