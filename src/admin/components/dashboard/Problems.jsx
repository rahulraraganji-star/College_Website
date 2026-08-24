import DashboardCard from "./DashboardCard";

const Problems = () => {
  const problems = [
    {
      label: "Missing Images",
      count: 2,
      status: "warning",
    },
    {
      label: "Broken PDF",
      count: 1,
      status: "error",
    },
    {
      label: "Empty Galleries",
      count: 4,
      status: "warning",
    },
    {
      label: "Draft Pages",
      count: 3,
      status: "neutral",
    },
    {
      label: "Broken Links",
      count: 0,
      status: "success",
    },
  ];

  const statusColors = {
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-gray-300",
    success: "bg-green-600",
  };

  return (
    <DashboardCard
      eyebrow="Problems"
      action="Auto-checked"
      className="min-h-[230px]"
    >
      <div className="divide-y divide-gray-200">
        {problems.map((problem) => (
          <div
            key={problem.label}
            className="flex items-center gap-3 py-3"
          >
            {/* STATUS DOT */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusColors[problem.status]}`}
            />

            {/* NAME */}
            <span className="flex-1 text-sm text-gray-900">
              {problem.label}
            </span>

            {/* COUNT */}
            <span
              className="
                flex
                items-center
                justify-center
                w-6
                h-6
                rounded-full
                border
                border-gray-300
                text-[11px]
                text-gray-700
              "
            >
              {problem.count}
            </span>

            {/* ARROW */}
            <span className="text-gray-400 text-sm">
              ›
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default Problems;