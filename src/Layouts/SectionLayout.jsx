import {
  Outlet,
  NavLink,
} from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

const SectionLayout = ({
  title,
  parentSlug,
}) => {
  const [navItems, setNavItems] =
    useState([]);

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/pages/sidebar/${parentSlug}`
    )
      .then((res) => res.json())
      .then((data) => {
        const dynamicNav = Array.isArray(data)
          ? data.map((page) => ({
              to: `/${parentSlug}/${page.slug}`,
              label: page.title,
            }))
          : [];
        setNavItems(dynamicNav);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [parentSlug]);

  return (
    <section className="w-full px-8 md:px-12 py-14 bg-[#F8F5F0]">
      <h1 className="font-['Fraunces'] text-4xl md:text-5xl font-medium text-[#2A2623] mb-12 tracking-tight">
        {title}
      </h1>

      <div className="flex gap-14">
        {/* SIDEBAR */}
        <aside
          className="
            w-64
            shrink-0
            sticky
            top-24
            self-start
            max-h-[calc(100vh-120px)]
            overflow-y-auto
            pr-2
          "
        >
          <p className="font-['Inter'] text-xs font-bold uppercase tracking-[0.18em] text-[#8A6B3F] mb-4 pl-4">
            On this page
          </p>

          <nav className="flex flex-col font-['Inter'] border-l border-[#2A2623]/10">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative w-full block pl-4 pr-4 py-3 -ml-px border-l transition-colors duration-200 text-base ${
                    isActive
                      ? "border-[#C9A555] text-[#2A2623] font-medium bg-gradient-to-r from-[#8A6B3F]/[0.06] to-transparent"
                      : "border-transparent text-[#2A2623]/55 hover:text-[#2A2623] hover:border-[#2A2623]/20"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default SectionLayout;