import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import DashboardCard from "./DashboardCard";

const QuickActions = ({
  onOpenCalendar = () => {},
}) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const actions = [
    {
      label: "Create Page",
      permission: "pages.create",
      action: "create-page",
      onClick: () => navigate("/admin/pages/create"),
    },
    {
      label: "College Calendar",
      permission: "pages.view",
      action: "open-calendar",
      onClick: onOpenCalendar,
    },
    {
      label: "Upload Media",
      permission: "media.upload",
      action: "upload-media",
      onClick: () => navigate("/admin/media"),
    },
    {
      label: "Edit Navigation",
      permission: "navigation.edit",
      action: "edit-navigation",
      onClick: () => navigate("/admin/navigation"),
    },
    {
      label: "Link Manager",
      permission: "link_manager.view",
      action: "link-manager",
      onClick: () => navigate("/admin/link-manager"),
    },
    {
      label: "Create User",
      permission: "users.create",
      action: "create-user",
      onClick: () => navigate("/admin/users/create"),
    },
    {
      label: "Manage Users",
      permission: "users.view",
      action: "manage-users",
      onClick: () => navigate("/admin/users"),
    },
    {
      label: "Audit Logs",
      permission: "audit.view",
      action: "audit-logs",
      onClick: () => navigate("/admin/audit-logs"),
    },
  ];

  const visibleActions = actions.filter((action) =>
    hasPermission(action.permission)
  );

  return (
    <DashboardCard
      eyebrow="Quick Actions"
      action={`${visibleActions.length} available`}
      className="min-h-[300px]"
    >
      <div className="grid grid-cols-2 gap-2">
        {visibleActions.map((action) => (
          <button
            key={action.action}
            type="button"
            onClick={action.onClick}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-gray-200
              px-3
              py-3
              text-left
              text-xs
              font-medium
              text-gray-700
              transition
              hover:border-gray-400
              hover:bg-gray-50
              active:scale-[0.98]
            "
          >
            <span className="text-base text-gray-400 font-light">
              +
            </span>

            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
};

export default QuickActions;