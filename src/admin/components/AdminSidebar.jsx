import { NavLink } from "react-router-dom";

/**
 * Fonts used below: Plus Jakarta Sans (nav/body) + Fraunces (brand mark).
 * Add this to your index.html <head> (or import in your global CSS):
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
 *
 * Or, if using Tailwind config, register them as font-brand / font-sans / font-mono.
 */

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", end: true }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/home", label: "Home Page" },
      { to: "/admin/pages", label: "Pages", count: 24 },
      { to: "/admin/media", label: "Media", count: 312 },
    ],
  },
  {
    label: "Structure",
    items: [{ to: "/admin/navigation", label: "Navigation" }],
  },
];

const AdminSidebar = () => {
  return (
    <aside
      className="w-64 min-h-screen bg-black text-neutral-300 flex flex-col antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-[15px] text-white"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          C
        </div>
        <span
          className="text-white text-[17px] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          CMS
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 flex flex-col gap-7 mt-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-[14.5px] transition-colors",
                      isActive
                        ? "bg-white/10 text-white font-semibold"
                        : "text-neutral-300 font-medium hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          isActive ? "bg-white" : "bg-neutral-500",
                        ].join(" ")}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.count !== undefined && (
                        <span
                          className="text-[11px] text-neutral-400"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-800 text-[11px] tracking-wide text-neutral-500">
        CMS v1.0
      </div>
    </aside>
  );
};

export default AdminSidebar;