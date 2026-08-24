import DashboardCard from "./DashboardCard";

const SystemInfo = () => {
  const system = [
    ["Environment", "Production"],
    ["React", "19"],
    ["Node", "22"],
    ["MongoDB", "8"],
    ["Express", "5"],
    ["Build", "2.3.1"],
  ];

  return (
    <DashboardCard
      eyebrow="System Info"
      action="Production"
      className="min-h-[300px]"
    >
      <div className="space-y-4">

        {system.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-gray-500">
              {label}
            </span>

            <div className="flex-1 border-t border-dotted border-gray-300" />

            <span className="text-sm font-medium text-gray-900">
              {value}
            </span>
          </div>
        ))}

      </div>
    </DashboardCard>
  );
};

export default SystemInfo;