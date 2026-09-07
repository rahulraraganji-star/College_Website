import DashboardCard from "./DashboardCard";

const LargestContent = ({ stats, loading }) => {
  const largestFile = stats?.largestContent?.largestFile || {
    name: "Exam_Schedule_2026.pdf",
    size: "4.2 MB",
  };

  const largestDoc = stats?.largestContent?.largestDoc || {
    name: "NAAC_Self_Study_Report.pdf",
    size: "8.5 MB",
  };

  const totalPages = stats?.pages?.total || 12;

  const items = [
    {
      label: "Largest Document / PDF",
      name: largestDoc.name || "Academic Prospectus.pdf",
      value: largestDoc.size || "8.5 MB",
    },
    {
      label: "Largest Media Asset",
      name: largestFile.name || "Campus_Hero_Banner.jpg",
      value: largestFile.size || "3.8 MB",
    },
    {
      label: "Published Pages",
      name: `${totalPages} Active CMS Pages`,
      value: `${stats?.pages?.published || totalPages} live`,
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
            <div className="min-w-0 pr-4">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.label}
              </p>

              <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">
                {loading ? "..." : item.name}
              </p>
            </div>

            <span className="text-sm font-semibold text-gray-900 shrink-0">
              {loading ? "..." : item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default LargestContent;