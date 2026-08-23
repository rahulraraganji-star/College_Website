import DashboardCard from "./DashboardCard";

const ActivityCard = ({ onOpenOverlay }) => {
  const activities = [
    {
      time: "2 min ago",
      user: "Rahul",
      action: "PUBLISHED",
      item: "Admission Notice",
    },
    {
      time: "12 min ago",
      user: "Office Staff",
      action: "UPLOADED",
      item: "Exam Schedule.pdf",
    },
    {
      time: "46 min ago",
      user: "Priya",
      action: "EDITED",
      item: "Faculty Directory",
    },
    {
      time: "Yesterday",
      user: "Admin",
      action: "DELETED",
      item: "Old Prospectus",
      danger: true,
    },
    {
      time: "Yesterday",
      user: "Rahul",
      action: "CREATED",
      item: "NAAC Self Study Report",
    },
  ];

  return (
    <DashboardCard
      eyebrow="Activity"
      action={
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live
        </span>
      }
      className="min-h-[425px]"
      onClick={onOpenOverlay}
    >
      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
          <div
            key={`${activity.user}-${activity.item}-${index}`}
            className="grid grid-cols-[64px_1fr] gap-4 py-4 first:pt-1 last:pb-0"
          >
            {/* TIME */}
            <div className="text-[11px] leading-4 text-gray-400">
              {activity.time}
            </div>

            {/* ACTIVITY */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">
                  {activity.user}
                </span>

                <span
                  className={`
                    inline-flex
                    items-center
                    rounded-md
                    border
                    px-2
                    py-0.5
                    text-[10px]
                    font-medium
                    tracking-wide
                    ${
                      activity.danger
                        ? "border-red-200 text-red-500"
                        : "border-gray-300 text-gray-500"
                    }
                  `}
                >
                  {activity.action}
                </span>
              </div>

              <div className="mt-1 text-xs text-gray-500 truncate">
                {activity.item}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW ALL */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          View all activity →
        </button>
      </div>
    </DashboardCard>
  );
};

export default ActivityCard;