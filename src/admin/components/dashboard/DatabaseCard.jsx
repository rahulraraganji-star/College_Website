import { useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";

const DatabaseCard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const collections = [
    {
      name: "Pages",
      count: stats?.pages?.total ?? 0,
      route: "/admin/pages",
    },
    {
      name: "Media Assets",
      count: stats?.media?.total ?? 0,
      route: "/admin/media",
    },
    {
      name: "Navigation Items",
      count: stats?.navigation?.items ?? stats?.navigation?.menus ?? 0,
      route: "/admin/navigation",
    },
    {
      name: "Users",
      count: stats?.users?.total ?? 0,
      route: "/admin/users",
    },
    {
      name: "Roles",
      count: stats?.roles?.total ?? 0,
      route: "/admin/roles",
    },
    {
      name: "Approval Requests",
      count: stats?.approvals?.total ?? 0,
      route: "/admin/approvals",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Database"
      action={`${collections.length} collections`}
      className="min-h-[300px]"
    >
      <div className="divide-y divide-gray-200">

        {collections.map((item) => (
          <div
            key={item.name}
            onClick={() => item.route && navigate(item.route)}
            className="
              flex
              items-center
              justify-between
              py-3
              cursor-pointer
              hover:bg-gray-50/80
              -mx-2
              px-2
              rounded-lg
              transition-colors
            "
          >
            <span className="text-sm font-medium text-gray-900">
              {item.name}
            </span>

            <div className="flex items-center gap-3">

              <span
                className="
                  flex
                  items-center
                  justify-center
                  min-w-8
                  h-6
                  px-2
                  rounded-full
                  border
                  border-gray-300
                  text-[11px]
                  font-semibold
                  text-gray-700
                  bg-gray-50
                "
              >
                {loading ? "..." : (item.count || 0).toLocaleString()}
              </span>

              <span className="text-gray-400">
                ›
              </span>

            </div>
          </div>
        ))}

      </div>
    </DashboardCard>
  );
};

export default DatabaseCard;