import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * AdminSidebar
 *
 * Fully permission-driven navigation.
 * - Super Admin: sees everything (permissions includes "*")
 * - Admin: sees items matching their permissions
 * - Dept Editor: sees only their pages + workspace
 * - All authenticated users have access to My Account
 */

const AdminSidebar = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin      = user?.role === "admin";
  const isDeptEditor = user?.role === "department_editor";

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  // ==========================================
  // BUILD NAV GROUPS
  // ==========================================

  const navGroups = [

    // ------------------------------------------
    // OVERVIEW
    // ------------------------------------------
    {
      label: "Overview",
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          end: true,
          show: isSuperAdmin || isAdmin,
        },
        {
          to: "/admin/workspace",
          label: "My Workspace",
          end: true,
          show: isDeptEditor,
        },
        {
          to: "/admin/account",
          label: "My Account",
          end: true,
          show: true,
        },
      ],
    },

    // ------------------------------------------
    // CONTENT
    // ------------------------------------------
    {
      label: "Content",
      items: [
        {
          to: "/admin/home",
          label: "Home Page",
          show: hasPermission("pages.edit") && (
            isSuperAdmin || isAdmin ||
            (user?.allowedPages || []).some((p) => p === "home" || p.startsWith("home:"))
          ),
        },
        {
          to: "/admin/pages",
          label: "Pages",
          show: hasPermission("pages.view"),
        },
        {
          to: "/admin/media",
          label: "Media",
          show: hasPermission("media.view"),
        },
      ],
    },

    // ------------------------------------------
    // WEBSITE
    // ------------------------------------------
    {
      label: "Website",
      items: [
        {
          to: "/admin/header",
          label: "Header",
          show: isSuperAdmin || isAdmin || hasPermission("settings.view") || hasPermission("settings.edit"),
        },
        {
          to: "/admin/footer",
          label: "Footer",
          show: isSuperAdmin || isAdmin || hasPermission("settings.view") || hasPermission("settings.edit"),
        },
      ],
    },

    // ------------------------------------------
    // STRUCTURE
    // ------------------------------------------
    {
      label: "Structure",
      items: [
        {
          to: "/admin/navigation",
          label: "Navigation",
          show: hasPermission("navigation.view"),
        },
        {
          to: "/admin/organogram",
          label: "Organogram",
          show: hasPermission("organogram.view"),
        },
        {
          to: "/admin/link-manager",
          label: "Link Manager",
          show: hasPermission("link_manager.view"),
        },
      ],
    },

    // ------------------------------------------
    // USERS & ACCESS
    // ------------------------------------------
    {
      label: "Users & Access",
      items: [
        {
          to: "/admin/users",
          label: "Users",
          show: hasPermission("users.view"),
        },
        {
          to: "/admin/roles",
          label: "Roles",
          show: hasPermission("roles.view"),
        },
      ],
    },

    // ------------------------------------------
    // WORKFLOWS
    // ------------------------------------------
    {
      label: "Workflows",
      items: [
        {
          to: "/admin/approvals",
          label: "Approvals",
          show: hasPermission("approvals.view"),
        },
        {
          to: "/admin/audit-logs",
          label: "Audit Log",
          show: hasPermission("audit.view"),
        },
      ],
    },
  ];


  return (
    <aside
      className="w-64 shrink-0 h-full bg-black text-neutral-300 flex flex-col antialiased overflow-hidden"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        .sidebar-minimal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-minimal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-minimal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }
        .sidebar-minimal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45);
        }
        .sidebar-minimal-scroll::-webkit-scrollbar-button {
          display: none;
        }
        .sidebar-minimal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-900">
        <div
          className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-[13px] font-bold text-white font-mono"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          C
        </div>
        <span
          className="text-white text-[16px] font-extrabold tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          College CMS
        </span>
      </div>

      {/* Nav groups with minimal scrollbar and bottom fade cue */}
      <div className="relative flex-1 flex flex-col min-h-0">
        <nav className="sidebar-minimal-scroll flex-1 px-3 flex flex-col gap-4 py-3 overflow-y-auto">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.show);

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 px-3 py-1.5 rounded-md text-[13.5px] transition-colors",
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
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Subtle bottom fade cue */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black to-transparent opacity-80" />
      </div>

      {/* Footer — logout */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-neutral-400 font-medium hover:bg-white/5 hover:text-white transition-colors"
        >
          <span>⎋</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;