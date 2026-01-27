import { NavLink, Outlet } from "react-router-dom";

const StaffLayout = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">Staff</h1>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <nav className="flex flex-col gap-2 text-sm">

            <NavLink
              to="/staff/faculty"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Teaching Faculty
            </NavLink>

            <NavLink
              to="/staff/non-teaching"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md transition ${
                  isActive
                    ? "bg-[#FFF4D6] text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Non-Teaching Staff
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

export default StaffLayout;
