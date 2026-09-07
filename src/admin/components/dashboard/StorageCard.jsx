import DashboardCard from "./DashboardCard";

const StorageCard = ({ stats, loading }) => {
  const storageData = stats?.media?.storage || {
    usedGB: 0.05,
    totalGB: 10,
    usedFormatted: stats?.media?.totalSizeFormatted || "52 MB",
    imagesPercentage: 65,
    docsPercentage: 25,
    othersPercentage: 10,
  };

  const imagesPct = storageData.imagesPercentage ?? 60;
  const docsPct = storageData.docsPercentage ?? 30;
  const otherPct = storageData.othersPercentage ?? 10;

  // Degrees for conic gradient
  const degImages = Math.round((imagesPct / 100) * 360);
  const degDocs = Math.round(((imagesPct + docsPct) / 100) * 360);

  // Percentage of allocated disk used
  const usedPercentage = Math.min(100, Math.max(1, (storageData.usedGB / (storageData.totalGB || 10)) * 100));

  return (
    <DashboardCard
      eyebrow="Storage"
      action={`${storageData.usedFormatted || `${storageData.usedGB} GB`} / ${storageData.totalGB || 10} GB`}
      className="min-h-[310px]"
    >
      {/* MAIN STORAGE SECTION */}
      <div className="flex items-center gap-8">

        {/* DONUT */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <div
            className="absolute inset-0 rounded-full transition-all duration-700 shadow-inner"
            style={{
              background: `conic-gradient(
                #111827 0deg ${degImages}deg,
                #9ca3af ${degImages}deg ${degDocs}deg,
                #e5e7eb ${degDocs}deg 360deg
              )`,
            }}
          />

          <div className="absolute inset-[16px] bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-gray-900">
              {loading ? "..." : (storageData.usedFormatted || `${storageData.usedGB} GB`)}
            </span>
            <span className="text-[9px] text-gray-400">Used</span>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-900" />
              <span className="text-xs text-gray-600 font-medium">
                Images
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {imagesPct}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-400" />
              <span className="text-xs text-gray-600 font-medium">
                Documents
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {docsPct}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-gray-200" />
              <span className="text-xs text-gray-600 font-medium">
                Other
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-900">
              {otherPct}%
            </span>
          </div>
        </div>
      </div>

      {/* STORAGE BAR */}
      <div className="mt-8">
        <div className="h-[6px] rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-700"
            style={{
              width: `${Math.max(2, usedPercentage)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">
            {storageData.usedFormatted || `${storageData.usedGB} GB`} used
          </span>

          <span className="text-[11px] text-gray-400">
            {storageData.totalGB || 10} GB total
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default StorageCard;