import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";

const API_URL = "/api";

const ApprovalQueue = ({ onOpen, stats }) => {
  const [approvalsData, setApprovalsData] = useState({
    pages: 0,
    media: 0,
    navigation: 0,
    other: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_URL}/approvals?status=pending&limit=20`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.approvals)) {
        const counts = { pages: 0, media: 0, navigation: 0, other: 0 };
        data.approvals.forEach((req) => {
          const type = (req.resourceType || "").toLowerCase();
          if (type.includes("page")) counts.pages++;
          else if (type.includes("media") || type.includes("file")) counts.media++;
          else if (type.includes("nav") || type.includes("menu")) counts.navigation++;
          else counts.other++;
        });
        setApprovalsData({
          ...counts,
          total: data.pagination?.total ?? data.approvals.length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch pending approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stats?.approvals) {
      setApprovalsData({
        pages: stats.approvals.byType?.pages || 0,
        media: stats.approvals.byType?.media || 0,
        navigation: stats.approvals.byType?.navigation || 0,
        other: stats.approvals.byType?.other || 0,
        total: stats.approvals.pending || 0,
      });
      setLoading(false);
    } else {
      fetchPending();
    }
  }, [stats]);

  const approvalItems = [
    { type: "Pages", count: approvalsData.pages },
    { type: "Media", count: approvalsData.media },
    { type: "Navigation", count: approvalsData.navigation },
    { type: "Other", count: approvalsData.other },
  ];

  return (
    <DashboardCard
      eyebrow="Pending Review"
      action={`${approvalsData.total} total`}
      className="min-h-[360px]"
      onClick={onOpen}
    >
      <div className="divide-y divide-gray-200">
        {approvalItems.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-900 font-medium">
              {item.type}
            </span>

            <div className="flex items-center gap-3">
              <span
                className={`
                  min-w-7 h-7 px-2
                  inline-flex items-center justify-center
                  rounded-full
                  border
                  text-xs font-semibold
                  ${
                    item.count > 0
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-gray-200 text-gray-400 bg-white"
                  }
                `}
              >
                {loading ? "..." : item.count}
              </span>

              <span className="text-gray-400 text-xs">
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
          className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View approval queue →
        </button>
      </div>
    </DashboardCard>
  );
};

export default ApprovalQueue;