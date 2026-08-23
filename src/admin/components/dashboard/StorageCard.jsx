import DashboardCard from "./DashboardCard";

const StorageCard = () => {
  const storage = {
    used: 5.3,
    total: 10,
    images: 62,
    documents: 31,
    other: 7,
  };

  const percentage = (storage.used / storage.total) * 100;

  return (
    <DashboardCard
      eyebrow="Storage"
      action={`${storage.used} / ${storage.total} GB`}
      className="min-h-[310px]"
    >
      {/* MAIN STORAGE SECTION */}
      <div className="flex items-center gap-8">

        {/* DONUT */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(
                #111827 0deg 223deg,
                #9ca3af 223deg 335deg,
                #e5e7eb 335deg 360deg
              )`,
            }}
          />

          <div className="absolute inset-[16px] bg-white rounded-full" />
        </div>

        {/* LEGEND */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-900" />
              <span className="text-xs text-gray-600">
                Images
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {storage.images}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-400" />
              <span className="text-xs text-gray-600">
                Documents
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {storage.documents}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-200" />
              <span className="text-xs text-gray-600">
                Other
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {storage.other}%
            </span>
          </div>
        </div>
      </div>

      {/* STORAGE BAR */}
      <div className="mt-8">
        <div className="h-[6px] rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">
            {storage.used} GB used
          </span>

          <span className="text-[11px] text-gray-400">
            {storage.total} GB total
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default StorageCard;