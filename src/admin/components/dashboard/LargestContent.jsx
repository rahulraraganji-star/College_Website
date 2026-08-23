import DashboardCard from "./DashboardCard";

const LargestContent = () => {
  const items = [
    {
      label: "Largest Page",
      name: "IQAC Report",
      value: "3.2 MB",
    },
    {
      label: "Largest Gallery",
      name: "Convocation 2025",
      value: "348 imgs",
    },
    {
      label: "Largest PDF",
      name: "Prospectus 2026",
      value: "42 MB",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Largest Content"
      className="min-h-[267px]"
    >
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {item.label}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {item.name}
              </p>
            </div>

            <span className="text-sm font-semibold text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default LargestContent;