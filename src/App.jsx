import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

/* GLOBAL */
import Header from "./Components/Header";
import Navbar from "./Components/NavBar";
import Footer from "./Components/Footer";

/* HOME */
import HomePageTemplate from "./Components/HomePageTemplate";

/* DYNAMIC */
import DynamicPage from "./Pages/DynamicPage";
import DynamicLayout from "./Layouts/DynamicLayout";

/* REUSABLE LAYOUT */
import SectionLayout from "./Layouts/SectionLayout";

/* PREMIUM CUSTOM LAYOUTS */
import AboutLayout from "./Layouts/AboutLayout";
import AdministrationLayout from "./Layouts/AdministrationLayout";

/* ADMIN */
import AdminRoutes from "./admin/routes/AdminRoutes";

function App() {

  const [header, setHeader] =
    useState(null);

  const [footer, setFooter] =
    useState(null);

  const location = useLocation();

  // FIXED: startsWith("/admin") was also matching
  // "/administration" since "/admin" is a text
  // prefix of it. Now we check for "/admin" as its
  // own path segment instead of a loose substring.
  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/settings/header"
    )
      .then((res) => res.json())
      .then(setHeader)
      .catch(() =>
        console.log("Header error")
      );

    fetch(
      "http://localhost:5000/api/settings/footer"
    )
      .then((res) => res.json())
      .then(setFooter)
      .catch(() =>
        console.log("Footer error")
      );

  }, []);

  return (
    <>

      {!isAdminRoute && (
        <>
          <Header data={header} />
          <Navbar />
        </>
      )}

      <Routes>

        {/* ADMIN */}
        {AdminRoutes}

        {/* HOME */}
        <Route
          path="/"
          element={<HomePageTemplate />}
        />

        {/* GENERIC PAGE */}
        <Route
          path="/page/:slug"
          element={<DynamicPage />}
        />

        {/* ABOUT */}
        <Route
          path="about"
          element={<AboutLayout />}
        >

          <Route
            index
            element={
              <Navigate
                to="history"
                replace
              />
            }
          />

          <Route
            element={<DynamicLayout />}
          >

            <Route
              path=":slug"
              element={<DynamicPage />}
            />

          </Route>

        </Route>

        {/* ADMINISTRATION */}
        <Route
          path="administration"
          element={<AdministrationLayout />}
        >

          <Route
            index
            element={
              <Navigate
                to="organogram"
                replace
              />
            }
          />

          <Route
            element={<DynamicLayout />}
          >

            <Route
              path=":slug"
              element={<DynamicPage />}
            />

          </Route>

        </Route>

        {/* STUDENT LIFE */}
        <Route
          path="student-life"
          element={
            <SectionLayout
              title="Student Life"
              parentSlug="student-life"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="support"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* ACADEMICS */}
        <Route
          path="academics"
          element={
            <SectionLayout
              title="Academics"
              parentSlug="academics"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="programmes"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* STAFF */}
        <Route
          path="staff"
          element={
            <SectionLayout
              title="Staff"
              parentSlug="staff"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="faculty"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* ADMISSIONS */}
        <Route
          path="admissions"
          element={
            <SectionLayout
              title="Admissions"
              parentSlug="admissions"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="prospectus"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* EXAMINATION */}
        <Route
          path="examination"
          element={
            <SectionLayout
              title="Examination"
              parentSlug="examination"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="committee"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* ACCREDITATION */}
        <Route
          path="accreditation"
          element={
            <SectionLayout
              title="Accreditation"
              parentSlug="accreditation"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="naac"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* RTI */}
        <Route
          path="rti"
          element={
            <SectionLayout
              title="RTI"
              parentSlug="rti"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="reservation-admission-recruitment"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* ALUMNI */}
        <Route
          path="alumni"
          element={
            <SectionLayout
              title="Alumni"
              parentSlug="alumni"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="about"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* INFRASTRUCTURE */}
        <Route
          path="infrastructure"
          element={
            <SectionLayout
              title="Infrastructure"
              parentSlug="infrastructure"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="facilities"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* IQAC */}
        <Route
          path="iqac"
          element={
            <SectionLayout
              title="IQAC"
              parentSlug="iqac"
            />
          }
        >

          <Route
            index
            element={
              <Navigate
                to="about"
                replace
              />
            }
          />

          <Route
            path=":slug"
            element={<DynamicPage />}
          />

        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-20 text-center text-2xl">
              404 – Page Not Found
            </div>
          }
        />

      </Routes>

      {!isAdminRoute && (
        <Footer data={footer} />
      )}

    </>
  );
}

export default App;