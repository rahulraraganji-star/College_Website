import DashboardCard from "./DashboardCard";

const HealthItem = ({
  label,
  status = "healthy",
}) => {
  const isWarning = status === "warning";

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-xs text-gray-700">
      <span
        className={`
          w-1.5
          h-1.5
          rounded-full
          ${isWarning ? "bg-amber-500" : "bg-green-500"}
        `}
      />

      <span>{label}</span>
    </div>
  );
};

const WebsiteHealth = () => {
  return (
    <DashboardCard className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-7">

        {/* Score */}
        <div className="shrink-0 flex items-center gap-5">
          <div className="relative w-[96px] h-[96px]">
            <div
              className="
                absolute inset-0
                rounded-full
                border-[9px]
                border-gray-100
              "
            />

            <div
              className="
                absolute inset-0
                rounded-full
                border-[9px]
                border-gray-950
                border-r-gray-200
                border-b-gray-200
                rotate-[-25deg]
              "
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-gray-950">
                96
              </span>

              <span className="text-[9px] text-gray-400">
                / 100
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-950">
              Website Health
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

              <span className="text-xs text-gray-400">
                Last checked 15 sec ago
              </span>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-2">
          <HealthItem label="Backend Online" />
          <HealthItem label="Database Connected" />
          <HealthItem label="Storage Healthy" />
          <HealthItem label="SSL Active" />
          <HealthItem
            label="4 Draft Pages"
            status="warning"
          />
          <HealthItem label="Last Backup Successful" />
        </div>
      </div>
    </DashboardCard>
  );
};

export default WebsiteHealth;