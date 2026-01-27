import { NavLink, Outlet, useParams } from "react-router-dom";

const ProgrammeLayout = () => {
  const { programme } = useParams();

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-6">
        {programme.toUpperCase()} Programme
      </h2>

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b">
        <NavLink
          to={`/academics/${programme}/subjects`}
          className={({ isActive }) =>
            `pb-2 font-medium ${
              isActive ? "border-b-2 border-[#F5B301]" : "text-gray-600"
            }`
          }
        >
          Subjects
        </NavLink>

        <NavLink
          to={`/academics/${programme}/syllabus`}
          className={({ isActive }) =>
            `pb-2 font-medium ${
              isActive ? "border-b-2 border-[#F5B301]" : "text-gray-600"
            }`
          }
        >
          Syllabus
        </NavLink>

        <NavLink
          to={`/academics/${programme}/outcomes`}
          className={({ isActive }) =>
            `pb-2 font-medium ${
              isActive ? "border-b-2 border-[#F5B301]" : "text-gray-600"
            }`
          }
        >
          Programme Outcomes
        </NavLink>
      </div>

      <Outlet />
    </section>
  );
};

export default ProgrammeLayout;
