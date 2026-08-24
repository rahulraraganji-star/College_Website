import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * AdminSidebar
 *
 * Fully permission-driven navigation.
 * - Super Admin: sees everything (permissions includes "*")
 * - Admin: sees items matching their permissions
 * - Dept Editor: sees only their pages + workspace
 */

const AdminSidebar = () => {
  const { user, hasPermission, hasPageAccess, logout } = useAuth();
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
    // OVERVIEW — admin/super_admin only
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
            // Dept editor: show if they have any home section access
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
      <nav className="flex-1 px-3 flex flex-col gap-7 mt-3">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.show);

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-neutral-400">
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
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer — logout */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[13px] text-neutral-400 font-medium hover:bg-white/5 hover:text-white transition-colors"
        >
          <span>⎋</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;