import DashboardCard from "./DashboardCard";

const VisitorsCard = () => {
  return (
    <DashboardCard
      eyebrow="Visitors Today"
      action="Last 7 days"
      className="min-h-[300px]"
    >
      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-2xl font-semibold text-gray-900">
            412
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Visitors
          </p>
        </div>

        <div>
          <p className="text-2xl font-semibold text-gray-900">
            29%
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
            Admissions
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Avg. Visit
          </span>

          <span className="font-medium text-gray-900">
            3m 24s
          </span>
        </div>

      </div>

      {/* SIMPLE ACTIVITY BARS */}
      <div className="flex items-end gap-2 h-16 mt-6">
        {[45, 65, 50, 80, 60, 70, 90].map(
          (height, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-300 rounded-t"
              style={{ height: `${height}%` }}
            />
          )
        )}
      </div>
    </DashboardCard>
  );
};

export default VisitorsCard;