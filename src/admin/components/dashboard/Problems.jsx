import { useNavigate } from "react-router-dom";
import DashboardCard from "./DashboardCard";

const Problems = ({ stats, loading }) => {
  const navigate = useNavigate();

  const draftPages = stats?.problems?.draftPages ?? stats?.pages?.draft ?? 0;
  const pendingApprovals = stats?.problems?.pendingApprovals ?? stats?.approvals?.pending ?? 0;
  const unmappedFiles = stats?.problems?.unmappedFiles ?? 0;
  const dbDisconnected = stats?.health?.dbConnected === false;

  const problems = [
    {
      label: "Draft Pages (Unpublished)",
      count: draftPages,
      status: draftPages > 0 ? "warning" : "success",
      route: "/admin/pages",
    },
    {
      label: "Pending Approvals",
      count: pendingApprovals,
      status: pendingApprovals > 0 ? "warning" : "success",
      route: "/admin/approvals",
    },
    {
      label: "Unmapped Legacy URLs",
      count: unmappedFiles,
      status: unmappedFiles > 0 ? "warning" : "success",
      route: "/admin/link-manager",
    },
    {
      label: "Database Connection Issues",
      count: dbDisconnected ? 1 : 0,
      status: dbDisconnected ? "error" : "success",
    },
  ];

  const statusColors = {
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-gray-300",
    success: "bg-green-600",
  };

  const totalIssues = (draftPages > 0 ? 1 : 0) + (pendingApprovals > 0 ? 1 : 0) + (unmappedFiles > 0 ? 1 : 0) + (dbDisconnected ? 1 : 0);

  return (
    <DashboardCard
      eyebrow="Problems & Actions"
      action={totalIssues === 0 ? "All clear" : `${totalIssues} attention items`}
      className="min-h-[230px]"
    >
      <div className="divide-y divide-gray-200">
        {problems.map((problem) => (
          <div
            key={problem.label}
            onClick={() => problem.route && navigate(problem.route)}
            className={`flex items-center gap-3 py-3 ${problem.route ? "cursor-pointer hover:bg-gray-50/80 -mx-2 px-2 rounded-lg transition-colors" : ""}`}
          >
            {/* STATUS DOT */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusColors[problem.status]}`}
            />

            {/* NAME */}
            <span className="flex-1 text-sm text-gray-900 font-medium truncate">
              {problem.label}
            </span>

            {/* COUNT */}
            <span
              className={`
                flex
                items-center
                justify-center
                min-w-6
                h-6
                px-1.5
                rounded-full
                border
                text-[11px]
                font-semibold
                ${problem.count > 0 ? "border-amber-300 bg-amber-50 text-amber-900" : "border-gray-200 text-gray-400 bg-white"}
              `}
            >
              {loading ? "..." : problem.count}
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