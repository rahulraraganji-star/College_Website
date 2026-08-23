import { useAuth } from "../../auth/AuthContext";
import DashboardCard from "./DashboardCard";

const QuickActions = ({
  onCreateUser = () => {},
  onManageUsers = () => {},
}) => {
  const { hasPermission } = useAuth();

  const actions = [
    {
      label: "Create Page",
      permission: "pages.create",
      action: "create-page",
    },
    {
      label: "Upload Media",
      permission: "media.upload",
      action: "upload-media",
    },
    {
      label: "Add Event",
      permission: "pages.create",
      action: "add-event",
    },
    {
      label: "Create Gallery",
      permission: "media.upload",
      action: "create-gallery",
    },
    {
      label: "Create Menu",
      permission: "navigation.edit",
      action: "create-menu",
    },
    {
      label: "Create User",
      permission: "users.create",
      action: "create-user",
    },
    {
      label: "Manage Users",
      permission: "users.manage",
      action: "manage-users",
    },
  ];

  const visibleActions = actions.filter((action) =>
    hasPermission(action.permission)
  );

  const handleAction = (action) => {
    if (action === "create-user") {
      onCreateUser();
      return;
    }

    if (action === "manage-users") {
      onManageUsers();
      return;
    }

    console.log("Quick action:", action);
  };

  return (
    <DashboardCard
      eyebrow="Quick Actions"
      action={`${visibleActions.length} actions`}
      className="min-h-[300px]"
    >
      <div className="grid grid-cols-2 gap-2">
        {visibleActions.map((action) => (
          <button
            key={action.action}
            type="button"
            onClick={() => handleAction(action.action)}
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
              hover:border-gray-300
              hover:bg-gray-50
            "
          >
            <span className="text-base text-gray-400">
              +
            </span>

            {action.label}
          </button>
        ))}
      </div>
    </DashboardCard>
  );
};

export default QuickActions;