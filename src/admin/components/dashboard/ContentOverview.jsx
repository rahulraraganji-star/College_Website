import DashboardCard from "./DashboardCard";

const ContentOverview = () => {
  const stats = [
    { value: 186, label: "Pages" },
    { value: 170, label: "Published" },
    { value: 16, label: "Draft" },
    { value: 2812, label: "Media" },
    { value: 521, label: "Documents" },
    { value: 1927, label: "Gallery Images" },
    { value: 43, label: "Events" },
    { value: 61, label: "Menu Items" },
  ];

  return (
    <DashboardCard
      eyebrow="Content Overview"
      action="7 collections"
      className="min-h-[425px]"
    >
      <div className="grid grid-cols-2">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`
              py-4
              ${index < 6 ? "border-b border-gray-200" : ""}
              ${index % 2 === 0 ? "pr-6" : "pl-6 border-l border-gray-200"}
            `}
          >
            <div className="text-2xl font-semibold tracking-tight text-gray-900">
              {stat.value.toLocaleString()}
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