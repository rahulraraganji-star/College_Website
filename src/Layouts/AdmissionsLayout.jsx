import {
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

const AdmissionsLayout = () => {

  const [navItems, setNavItems] =
    useState([]);

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/pages/sidebar/admissions"
    )
      .then((res) => res.json())

      .then((data) => {

        const dynamicNav = data.map(
          (page) => ({
            to: `/admissions/${page.slug}`,
            label: page.title,
          })
        );

        setNavItems(dynamicNav);

      })

      .catch((err) => {
        console.error(err);
      });

  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-semibold mb-8">
        Admissions
      </h1>

      <div className="grid grid-cols-12 gap-10">

        {/* Sidebar */}
        <aside
          className="
            col-span-12 md:col-span-3
            md:sticky md:top-24
            self-start
            max-h-[calc(100vh-120px)]
            overflow-y-auto
            pr-2
          "
        >

          <nav className="flex flex-col gap-2 text-sm">

            {navItems.map((item) => (

              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition ${
                    isActive
                      ? "bg-[#FFF4D6] text-black font-semibold"
                      : "text-gray-600 hover:text-black"
                  }`
                }
              >
                {item.label}
              </NavLink>

            ))}

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

export default AdmissionsLayout;

