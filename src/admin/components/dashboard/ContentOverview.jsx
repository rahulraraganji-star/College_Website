import DashboardCard from "./DashboardCard";

const ContentOverview = ({ stats, loading }) => {
  const pagesTotal = stats?.pages?.total ?? 0;
  const published = stats?.pages?.published ?? 0;
  const draft = stats?.pages?.draft ?? 0;
  const mediaTotal = stats?.media?.total ?? 0;
  const docs = stats?.media?.documents ?? 0;
  const images = stats?.media?.images ?? 0;
  const menuItems = stats?.navigation?.items ?? stats?.navigation?.menus ?? 0;
  const users = stats?.users?.total ?? 0;

  const statItems = [
    { value: pagesTotal, label: "Pages" },
    { value: published, label: "Published" },
    { value: draft, label: "Draft" },
    { value: mediaTotal, label: "Media Files" },
    { value: docs, label: "Documents & PDFs" },
    { value: images, label: "Gallery Images" },
    { value: menuItems, label: "Menu Items" },
    { value: users, label: "Active Users" },
  ];

  const collectionsCount = stats?.collections?.length || 7;

  return (
    <DashboardCard
      eyebrow="Content Overview"
      action={`${collectionsCount} collections`}
      className="min-h-[425px]"
    >
      <div className="grid grid-cols-2">
        {statItems.map((stat, index) => (
          <div
            key={stat.label}
            className={`
              py-4
              ${index < 6 ? "border-b border-gray-200" : ""}
              ${index % 2 === 0 ? "pr-6" : "pl-6 border-l border-gray-200"}
            `}
          >
            <div className="text-2xl font-semibold tracking-tight text-gray-900">
              {loading ? "..." : (stat.value ?? 0).toLocaleString()}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default ContentOverview;