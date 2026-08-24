import DashboardCard from "./DashboardCard";

const ServerStatus = () => {
  const server = {
    backend: "Running",
    database: "Connected",
    apiLatency: "42 ms",
    node: "22.20",
    express: "5.1",
    memory: "312 MB",
    cpu: "11%",
  };

  return (
    <DashboardCard
      eyebrow="Server Status"
      action="Uptime 6d"
      className="min-h-[310px]"
    >
      <div className="space-y-4">

        {/* BACKEND */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />

          <span className="text-sm text-gray-500">
            Backend
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.backend}
          </span>
        </div>

        {/* DATABASE */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />

          <span className="text-sm text-gray-500">
            MongoDB
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.database}
          </span>
        </div>

        {/* API LATENCY */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            API Latency
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.apiLatency}
          </span>
        </div>

        {/* NODE */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Node
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.node}
          </span>
        </div>

        {/* EXPRESS */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Express
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.express}
          </span>
        </div>

        {/* MEMORY */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Memory
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.memory}
          </span>
        </div>

        {/* CPU */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            CPU
          </span>

          <div className="flex-1 border-t border-dotted border-gray-300" />

          <span className="text-sm font-medium text-gray-900">
            {server.cpu}
          </span>
        </div>

      </div>
    </DashboardCard>
  );
};

export default ServerStatus;