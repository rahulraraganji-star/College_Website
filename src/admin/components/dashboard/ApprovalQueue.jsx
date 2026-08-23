import DashboardCard from "./DashboardCard";

const ApprovalQueue = ({ onOpen }) => {
  const approvals = [
    {
      type: "Pages",
      count: 4,
    },
    {
      type: "Media",
      count: 2,
    },
    {
      type: "Navigation",
      count: 1,
    },
    {
      type: "Comments",
      count: 0,
    },
  ];

  const total = approvals.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <DashboardCard
      eyebrow="Pending Review"
      action={`${total} total`}
      className="min-h-[360px]"
      onClick={onOpen}
    >
      <div className="divide-y divide-gray-200">
        {approvals.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-900">
              {item.type}
            </span>

            <div className="flex items-center gap-3">
              <span
                className={`
                  min-w-7 h-7 px-2
                  inline-flex items-center justify-center
                  rounded-full
                  border
                  text-xs font-medium
                  ${
                    item.count > 0
                      ? "border-gray-300 text-gray-900"
                      : "border-gray-200 text-gray-400"
                  }
                `}
              >
                {item.count}
              </span>

              <span className="text-gray-400">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          View approval queue →
        </button>
      </div>
    </DashboardCard>
  );
};

export default ApprovalQueue;