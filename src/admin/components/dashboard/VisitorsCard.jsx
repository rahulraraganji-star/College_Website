import DashboardCard from "./DashboardCard";

const VisitorsCard = ({ stats, onOpenOverlay }) => {
  const analytics = stats?.analytics;

  const visitorsCount = analytics?.visitors ?? 412;
  const bounceRate = analytics?.bounceRate ?? "29%";
  const mostViewed = analytics?.mostViewed ?? "Admissions";
  const avgVisit = analytics?.avgVisit ?? "3m 24s";
  const bars = analytics?.activityBars || [45, 65, 50, 80, 60, 70, 90];

  return (
    <DashboardCard
      eyebrow="Visitors Today"
      action={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenOverlay?.();
          }}
          className="text-xs text-gray-400 hover:text-gray-700 hover:underline transition-colors"
        >
          Last 7 days
        </button>
      }
      className="min-h-[300px]"
      onClick={onOpenOverlay}
    >
      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-2xl font-semibold text-gray-900">
            {visitorsCount}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Visitors
          </p>
        </div>

        <div>
          <p className="text-2xl font-semibold text-gray-900">
            {bounceRate}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Bounce Rate
          </p>
        </div>

      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Most Viewed
          </span>

          <span className="font-medium text-gray-900">
            {mostViewed}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Avg. Visit
          </span>

          <span className="font-medium text-gray-900">
            {avgVisit}
          </span>
        </div>

      </div>

      {/* SIMPLE ACTIVITY BARS */}
      <div className="flex items-end gap-2 h-16 mt-6">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 bg-gray-300 hover:bg-gray-400 rounded-t transition-colors"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </DashboardCard>
  );
};

export default VisitorsCard;