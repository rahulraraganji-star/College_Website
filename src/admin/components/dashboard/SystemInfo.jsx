import React from "react";
import DashboardCard from "./DashboardCard";

const SystemInfo = ({ stats, loading }) => {
  const envMode = import.meta.env.MODE === "production" ? "Production" : "Development";
  const nodeVer = (stats?.server?.nodeVersion || "v22.20").replace("v", "");
  const expressVer = stats?.server?.expressVersion || "5.2";
  const dbStatus = stats?.server?.database || "Connected";

  const system = [
    ["Environment", envMode],
    ["React", React.version || "19.2"],
    ["Node.js", nodeVer],
    ["Database", `MongoDB (${dbStatus})`],
    ["Express", expressVer],
    ["Vite", "7.2 (ESM)"],
  ];

  return (
    <DashboardCard
      eyebrow="System Info"
      action={envMode}
      className="min-h-[300px]"
    >
      <div className="space-y-4">

        {system.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-gray-500 font-medium shrink-0">
              {label}
            </span>

            <div className="flex-1 border-t border-dotted border-gray-300 min-w-[8px]" />

            <span className="text-sm font-semibold text-gray-900 font-mono shrink-0">
              {loading ? "..." : value}
            </span>
          </div>
        ))}

      </div>
    </DashboardCard>
  );
};

export default SystemInfo;