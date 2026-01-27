import { Outlet, NavLink } from "react-router-dom";

const ExaminationLayout = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">Examination</h1>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <nav className="flex flex-col gap-2 text-sm">

            <NavLink
              to="/examination/committee"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Examination Committee
            </NavLink>

            <NavLink
              to="/examination/ordinances"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Ordinances
            </NavLink>

            <NavLink
              to="/examination/schedule"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Exam Schedule
            </NavLink>

            <NavLink
              to="/examination/notices"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Exam Notices
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

export default ExaminationLayout;
