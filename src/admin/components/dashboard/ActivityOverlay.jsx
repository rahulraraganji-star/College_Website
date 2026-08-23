const ActivityOverlay = ({ onClose }) => {
  const activities = [
    {
      time: "2 min ago",
      user: "Rahul",
      action: "PUBLISHED",
      resource: "Admission Notice",
      details: "Published the Admission Notice page.",
    },
    {
      time: "12 min ago",
      user: "Office Staff",
      action: "UPLOADED",
      resource: "Exam Schedule.pdf",
      details: "Uploaded a new examination schedule document.",
    },
    {
      time: "46 min ago",
      user: "Priya",
      action: "EDITED",
      resource: "Faculty Directory",
      details: "Updated faculty directory information.",
    },
    {
      time: "Yesterday",
      user: "Admin",
      action: "DELETED",
      resource: "Old Prospectus",
      details: "Deleted the old prospectus document.",
      danger: true,
    },
    {
      time: "Yesterday",
      user: "Rahul",
      action: "CREATED",
      resource: "NAAC Self Study Report",
      details: "Created a new NAAC self-study report.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close activity"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* OVERLAY */}
      <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Dashboard
            </div>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent activity across the CMS.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
          {activities.map((activity, index) => (
            <div
              key={`${activity.user}-${activity.resource}-${index}`}
              className="grid grid-cols-[100px_1fr] gap-6 px-7 py-5 border-b border-gray-100 last:border-b-0"
            >
              {/* TIME */}
              <div className="text-xs text-gray-400">
                {activity.time}
              </div>

              {/* DETAILS */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {activity.user}
                  </span>

                  <span
                    className={`
                      rounded-md
                      border
                      px-2
                      py-0.5
                      text-[10px]
                      font-medium
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

                <div className="mt-1 text-sm font-medium text-gray-800">
                  {activity.resource}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {activity.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityOverlay;