import DashboardCard from "./DashboardCard";

const Deployments = ({ stats }) => {
  const envMode = import.meta.env.MODE === "production" ? "Production" : "Development";
  const uptime = stats?.server?.uptimeFormatted || "Active";

  const deployment = {
    version: "v1.0.0",
    environment: envMode,
    branch: "main",
    commit: "HEAD",
    deployed: uptime,
  };

  return (
    <DashboardCard
      eyebrow="Deployment"
      action="Live"
      className="min-h-[300px]"
    >
      <div className="space-y-4">

        <div>
          <p className="text-2xl font-semibold text-gray-900 font-mono">
            {deployment.version}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Build Release
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Environment
            </span>

            <span className="font-medium text-gray-900">
              {deployment.environment}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Branch
            </span>

            <span className="font-medium text-gray-900 font-mono text-xs">
              {deployment.branch}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Commit
            </span>

            <span className="font-mono text-xs text-gray-900">
              {deployment.commit}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Server Uptime
            </span>

            <span className="font-medium text-gray-900">
              {deployment.deployed}
            </span>
          </div>

        </div>

      </div>
    </DashboardCard>
  );
};

export default Deployments;