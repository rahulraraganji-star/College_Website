import {
  Outlet,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

/* ─────────────────────────────────────────
   DYNAMIC ACTIVE META
───────────────────────────────────────── */
function getActiveMeta(pathname, navItems) {

  const nav = navItems.find(
    (x) => pathname.startsWith(x.to)
  );

  return {
    label:
      nav?.label ?? "Overview",

    summary:
      "Browse key institutional information in a clear, scannable format.",
  };
}

/* ─────────────────────────────────────────
   LAYOUT
───────────────────────────────────────── */
export default function Aboutus_Layout() {

  const { pathname } = useLocation();

  const [navItems, setNavItems] = useState([]);

 useEffect(() => {

  fetch(
    "http://localhost:5000/api/pages/sidebar/about"
  )
    .then((res) => res.json())

    .then((data) => {

      const dynamicNav = data.map(
        (page) => ({
          to: `/about/${page.slug}`,
          label: page.title,
          icon: InfoIcon,
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
    <div
      className="relative min-h-screen bg-[#F8F5F0]"
      style={{
        fontFamily:
          "'Inter', system-ui, sans-serif",
      }}
    >

      {/* ── Google Fonts + motion utilities ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Inter:wght@400;500;600&display=swap');

        .ff-display {
          font-family: 'Fraunces', Georgia, serif;
        }

        .sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(191,160,122,0.35);
  border-radius: 999px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

        .nav-accent-bar {
          position: absolute;
          left: -1.25rem;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          border-radius: 2px;
          background: linear-gradient(to bottom, #C8A97E, #7A5B30);
          transition:
            height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s ease;
        }

        .nav-accent-bar.is-active {
          height: 1.6rem;
          opacity: 1;
        }

        .nav-accent-bar.is-hidden {
          height: 0;
          opacity: 0;
        }

        .nav-icon-wrap {
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .nav-row:hover .nav-icon-wrap {
          transform: translateY(-1px);
        }

        @keyframes ghostDrift {
          0%,100% {
            transform: translateX(0px);
          }

          50% {
            transform: translateX(8px);
          }
        }

        .ghost-word {
          animation: ghostDrift 40s ease-in-out infinite;
        }

        .rule-draw {
          background: linear-gradient(
            to right,
            #C8A97E,
            #C8A97E33,
            transparent
          );

          height: 1px;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-[#EDE5D8]/55 via-[#F4EEE5]/40 to-[#F8F5F0]" />

        <div
          className="absolute -top-48 -right-32 h-[700px] w-[700px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at center, #E4D6C0 0%, transparent 68%)",
          }}
        />

      </div>

      {/* HERO */}
      <header className="relative overflow-hidden">

        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

          {/* BREADCRUMB */}
          <nav
            aria-label="Breadcrumb"
            className="pt-10 pb-12"
          >

            <ol className="flex items-center gap-2.5 text-xs text-[#6B645C]">

              <li className="inline-flex items-center gap-1.5">

                <HomeIcon className="h-3.5 w-3.5 text-[#A8824F]" />

                <span className="font-medium text-[#2A2623]">
                  Home
                </span>

              </li>

              <li className="text-[#BFA07A]">
                /
              </li>

              <li className="font-medium text-[#2A2623]">
                About
              </li>

              <li className="text-[#BFA07A]">
                /
              </li>

              <li className="text-[#6B645C] truncate max-w-[160px]">
                {meta.label}
              </li>

            </ol>

          </nav>

          {/* HERO GRID */}
          <div className="relative grid grid-cols-12 items-stretch gap-6 pb-20 sm:pb-28">

            <span
              aria-hidden="true"
              className="
                ff-display ghost-word pointer-events-none select-none
                absolute -bottom-2 left-0
                text-[8rem] sm:text-[13rem] lg:text-[18rem]
                leading-none tracking-tight text-[#2A2623]
              "
              style={{
                opacity: 0.04,
                zIndex: 0,
              }}
            >
              Fragnel
            </span>

            {/* LEFT */}
            <div
              className="relative col-span-12 lg:col-span-7 flex flex-col justify-end"
              style={{ zIndex: 1 }}
            >

              <p className="mb-7 text-[10px] font-semibold tracking-[0.46em] uppercase text-[#BFA07A]">
                Fragnel College — Est. 1985
              </p>

              <h1
                className="ff-display tracking-tight leading-[0.86] text-[#2A2623]"
                style={{
                  fontSize:
                    "clamp(4.5rem, 12vw, 10.5rem)",
                }}
              >

                About

                <br />

                <em
                  className="ff-display"
                  style={{
                    fontStyle: "italic",
                    color: "#8A6B3F",
                    fontWeight: 300,
                  }}
                >
                  Us.
                </em>

              </h1>

            </div>

            {/* RIGHT */}
            <div
              className="col-span-12 lg:col-span-5 flex flex-col justify-between gap-10 lg:pl-10 lg:border-l"
              style={{
                zIndex: 1,
                borderColor:
                  "rgba(191,160,122,0.22)",
              }}
            >

              <div className="space-y-0">

                <p className="mb-5 text-[9px] font-semibold tracking-[0.42em] uppercase text-[#BFA07A]">
                  At a glance
                </p>

                {[
                  {
                    label: "Established",
                    value: "1985",
                  },

                  {
                    label: "Accreditation",
                    value: "NAAC Certified",
                  },

                  {
                    label: "Sections",
                    value: `${navItems.length} Covered`,
                  },

                ].map((stat, i) => (

                  <div
                    key={i}
                    className="flex items-baseline justify-between py-3.5 border-b"
                    style={{
                      borderColor:
                        "rgba(42,38,35,0.08)",
                    }}
                  >

                    <span className="text-xs text-[#6B645C] tracking-wide">
                      {stat.label}
                    </span>

                    <span className="ff-display text-base font-normal text-[#2A2623]">
                      {stat.value}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* BODY */}
      <main className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-16 sm:py-24">

        <div className="grid grid-cols-12 gap-10 lg:gap-16 xl:gap-20">

          {/* SIDEBAR */}
          <aside className="col-span-12 lg:col-span-3">

            <div
  className="
    sidebar-scroll
    lg:sticky lg:top-24
    max-h-[calc(100vh-120px)]
    overflow-y-auto
    pr-2
  "
>

              <p className="mb-6 text-[10px] font-semibold tracking-[0.42em] uppercase text-[#BFA07A]">
                — Contents
              </p>

              <nav>

                {navItems.map((item) => (

                  <NavLink
                    key={item.to}
                    to={item.to}
                  >

                    {({ isActive }) => (

                      <span
                        className={[
                          "nav-row relative flex items-center gap-3.5 py-4 cursor-pointer",
                          "border-b transition-colors duration-200",

                          isActive
                            ? "border-[#BFA07A]/60"
                            : "border-[#2A2623]/[0.07] hover:border-[#BFA07A]/30",
                        ].join(" ")}
                      >

                        <span
                          className={[
                            "nav-accent-bar",
                            isActive
                              ? "is-active"
                              : "is-hidden",
                          ].join(" ")}
                        />

                        <span
                          className={[
                            "nav-icon-wrap grid h-8 w-8 shrink-0 place-items-center rounded-xl",

                            isActive
                              ? "bg-[#C8A97E]/15"
                              : "bg-[#2A2623]/[0.04]",
                          ].join(" ")}
                        >

                          <item.icon
                            className={[
                              "h-3.5 w-3.5",

                              isActive
                                ? "text-[#8A6B3F]"
                                : "text-[#6B645C]",
                            ].join(" ")}
                          />

                        </span>

                        <span
                          className={[
                            "flex-1 min-w-0 text-sm leading-5",

                            isActive
                              ? "font-medium text-[#2A2623]"
                              : "text-[#6B645C]",
                          ].join(" ")}
                        >

                          {item.label}

                        </span>

                      </span>

                    )}

                  </NavLink>

                ))}

              </nav>

            </div>

          </aside>

          {/* CONTENT */}
          <section className="col-span-12 lg:col-span-9">

            <div className="mb-14">

              <p className="mb-4 text-[10px] font-semibold tracking-[0.42em] uppercase text-[#BFA07A]">
                About — {meta.label}
              </p>

              <h2
                className="ff-display font-light tracking-tight text-[#2A2623] leading-tight"
                style={{
                  fontSize:
                    "clamp(2rem, 4.5vw, 3.5rem)",
                }}
              >
                {meta.label}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6B645C] max-w-xl">
                {meta.summary}
              </p>

              <div className="rule-draw mt-7 w-full" />

            </div>

            <article
              className="
                max-w-[43rem]
                prose prose-lg prose-neutral
              "
            >

              <Outlet />

            </article>

          </section>

        </div>

      </main>

    </div>
  );
}

/* ICONS */

function IconBase({
  children,
  className = "",
}) {

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HomeIcon({
  className = "",
}) {

  return (
    <IconBase className={className}>

      <path
        d="M4 11l8-7 8 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.5 10.5V20a1 1 0 001 1H10v-5a1 1 0 011-1h2a1 1 0 011 1v5h2.5a1 1 0 001-1v-9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </IconBase>
  );
}

function InfoIcon({
  className = "",
}) {

  return (
    <IconBase className={className}>

      <path
        d="M12 17v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 8h.01"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      <path
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.6"
      />

    </IconBase>
  );
}