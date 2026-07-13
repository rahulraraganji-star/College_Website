import {
  Outlet,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

function getActiveMeta(
  pathname,
  navItems
) {

  const nav = navItems.find((x) =>
    pathname.startsWith(x.to)
  );

  return {
    label: nav?.label ?? "Administration",

    summary:
      "Administrative structure, statutory bodies, committees, and official notices that govern institutional operations.",
  };
}

export default function AdministrationLayout() {

  const [navItems, setNavItems] =
    useState([]);

  const { pathname } = useLocation();

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/pages/sidebar/administration"
    )
      .then((res) => res.json())

      .then((data) => {

        const dynamicNav = data.map(
          (page) => ({
            to: `/administration/${page.slug}`,
            label: page.title,
          })
        );

        setNavItems(dynamicNav);

      })

      .catch((err) => {
        console.error(err);
      });

  }, []);

  const meta = getActiveMeta(
    pathname,
    navItems
  );

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] text-neutral-900">

      {/* BACKDROP */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -top-28 left-1/2 h-[560px] w-[1060px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-200/55 via-white/70 to-indigo-200/40 blur-3xl" />

        <div className="absolute -bottom-44 right-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-fuchsia-200/20 via-cyan-200/30 to-white/45 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(1200px_720px_at_10%_-10%,rgba(255,255,255,0.96),rgba(255,255,255,0)),radial-gradient(900px_520px_at_90%_0%,rgba(255,214,148,0.55),rgba(255,255,255,0))]" />

        <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(to_right,rgba(17,24,39,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.65)_1px,transparent_1px)] [background-size:92px_92px]" />

      </div>

      {/* HEADER */}
      <header className="z-40 border-b border-black/10 bg-white/70 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="py-8 sm:py-10">

            <p className="text-[11px] font-semibold tracking-[0.32em] text-neutral-500 uppercase">
              Administration
            </p>

            <h1 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">

              <span className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-500 bg-clip-text text-transparent">
                Administration
              </span>

            </h1>

            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-neutral-600">
              Centralized access to governance structures,
              committees, statutory bodies, and official
              institutional communications.
            </p>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* CONTEXT CARD */}
        <div
          className="
            mb-8 rounded-[28px] p-[1px]
            bg-gradient-to-r from-amber-200/60
            via-black/10 to-indigo-200/45
            shadow-[0_30px_120px_-70px_rgba(0,0,0,0.25)]
          "
        >

          <div className="relative overflow-hidden rounded-[27px] bg-white/75 backdrop-blur-xl">

            <div
              className="
                absolute inset-0
                bg-[radial-gradient(1200px_520px_at_10%_0%,rgba(255,214,148,0.45),rgba(255,255,255,0)),
                radial-gradient(900px_420px_at_95%_0%,rgba(165,180,252,0.35),rgba(255,255,255,0))]
              "
            />

            <div className="relative p-6 sm:p-8">

              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-neutral-700">

                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />

                <span className="font-medium">
                  {meta.label}
                </span>

              </div>

              <h2 className="mt-3 text-lg sm:text-xl font-semibold text-neutral-900">
                Administrative overview
              </h2>

              <p className="mt-2 text-sm text-neutral-700 leading-6">
                {meta.summary}
              </p>

            </div>

          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8 lg:gap-10">

          {/* SIDEBAR */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">

            <div
              className="
                md:sticky md:top-24
                max-h-[calc(100vh-120px)]
                overflow-y-auto
                pr-2
              "
            >

              <div className="rounded-[28px] border border-black/10 bg-white/75 backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(0,0,0,0.25)] overflow-hidden">

                <div className="px-6 py-5 border-b border-black/5">

                  <p className="text-[11px] font-semibold tracking-[0.28em] text-neutral-500 uppercase">
                    Sections
                  </p>

                </div>

                <nav className="p-2">

                  {navItems.map((item) => (

                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          "block rounded-2xl px-5 py-3 text-sm transition-colors",

                          isActive
                            ? "bg-black/5 text-neutral-900 font-medium"
                            : "text-neutral-700 hover:bg-black/5",

                        ].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>

                  ))}

                </nav>

              </div>

            </div>

          </aside>

          {/* CONTENT */}
          <section className="col-span-12 md:col-span-8 lg:col-span-9">

            <div className="rounded-[28px] border border-black/10 bg-white/75 backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(0,0,0,0.25)] overflow-hidden">

              <div className="border-b border-black/5 px-6 sm:px-10 py-6">

                <p className="text-sm text-neutral-600">

                  {meta.label}

                  <span className="mx-2 text-neutral-300">
                    •
                  </span>

                  <span className="text-neutral-500">
                    Administrative content
                  </span>

                </p>

              </div>

              <div className="p-6 sm:p-10">

                <div className="max-w-3xl prose prose-neutral md:prose-lg prose-p:text-neutral-700 prose-li:text-neutral-700 prose-strong:text-neutral-900">

                  <Outlet />

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

