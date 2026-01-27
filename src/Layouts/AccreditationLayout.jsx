import { Outlet, NavLink } from "react-router-dom";

const AccreditationLayout = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">
        Accreditation & Rankings
      </h1>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <nav className="flex flex-col gap-2 text-sm">

          

            <NavLink
              to="/accreditation/naac"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              NAAC
            </NavLink>

            <NavLink
              to="/accreditation/nirf"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              NIRF
            </NavLink>

            <NavLink
              to="/accreditation/aishe"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              AISHE
            </NavLink>

            <NavLink
              to="/accreditation/india-today"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              India Today Ranking
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

export default AccreditationLayout;
