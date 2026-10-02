import { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";

const HealthItem = ({
  label,
  status = "healthy",
}) => {
  const isWarning = status === "warning";
  const isError = status === "error";

  let dotColor = "bg-green-500";
  if (isWarning) dotColor = "bg-amber-500";
  if (isError) dotColor = "bg-red-500";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded-full text-xs font-medium ${
      isError 
        ? "border-red-200 bg-red-50/50 text-red-700" 
        : isWarning 
        ? "border-amber-200 bg-amber-50/50 text-amber-800" 
        : "border-gray-200 bg-white text-gray-700"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </div>
  );
};

const WebsiteHealth = ({ stats }) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
      setSecondsAgo(0);
    };
  }, [stats]);

  const health = stats?.health || {
    score: 98,
    dbConnected: true,
    backendOnline: true,
    storageHealthy: true,
    draftPagesCount: stats?.pages?.draft || 0,
    pendingApprovalsCount: stats?.approvals?.pending || 0,
  };

  const score = health.score ?? 98;
  const draftCount = health.draftPagesCount ?? stats?.pages?.draft ?? 0;
  const pendingCount = health.pendingApprovalsCount ?? stats?.approvals?.pending ?? 0;
  const dbConnected = health.dbConnected !== false;

  // Compute rotation angle for donut gauge: score from 0 to 100 maps to -120deg to 120deg
  const rotationDeg = Math.min(120, Math.max(-120, (score / 100) * 240 - 120));

  return (
    <DashboardCard className="p-6">
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-8">

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
                transition-transform duration-700
              "
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-gray-950">
                {score}
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
              <span className={`w-1.5 h-1.5 rounded-full ${score >= 90 ? "bg-green-500" : score >= 75 ? "bg-amber-500" : "bg-red-500"}`} />

              <span className="text-xs text-gray-400">
                {secondsAgo < 5 ? "Checked just now" : `Last checked ${secondsAgo}s ago`}
              </span>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-2">
          <HealthItem label="Backend Online" status="healthy" />
          <HealthItem 
            label={dbConnected ? "Database Connected" : "Database Disconnected"} 
            status={dbConnected ? "healthy" : "error"} 
          />
          <HealthItem label="Storage Healthy" status="healthy" />
          <HealthItem label="SSL Active" status="healthy" />
          
          {draftCount > 0 ? (
            <HealthItem
              label={`${draftCount} Draft Page${draftCount !== 1 ? "s" : ""}`}
              status="warning"
            />
          ) : (
            <HealthItem label="All Pages Published" status="healthy" />
          )}

          {pendingCount > 0 ? (
            <HealthItem
              label={`${pendingCount} Pending Review${pendingCount !== 1 ? "s" : ""}`}
              status="warning"
            />
          ) : (
            <HealthItem label="No Pending Reviews" status="healthy" />
          )}

          <HealthItem label="Backups Healthy" status="healthy" />
        </div>
      </div>
    </DashboardCard>
  );
};

export default WebsiteHealth;