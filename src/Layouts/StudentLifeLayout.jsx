import { Outlet, NavLink } from "react-router-dom";

const StudentLifeLayout = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">Student Life</h1>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <nav className="flex flex-col gap-2 text-sm">

            <NavLink
              to="/student-life/support"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Student Support Services
            </NavLink>

            <NavLink
              to="/student-life/clubs"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Clubs & Cells
            </NavLink>

            <NavLink
              to="/student-life/council"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Student Council
            </NavLink>

            <NavLink
              to="/student-life/ncc"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              NCC
            </NavLink>

            <NavLink
              to="/student-life/nss"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              NSS
            </NavLink>

            <NavLink
              to="/student-life/sports"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Sports Facilities
            </NavLink>

            <NavLink
              to="/student-life/placements"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Placements & Internships
            </NavLink>

            <NavLink
              to="/student-life/counselling"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Counselling
            </NavLink>

            <NavLink
              to="/student-life/awards"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Awards & Scholarships
            </NavLink>

          </nav>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9">
          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default StudentLifeLayout;
