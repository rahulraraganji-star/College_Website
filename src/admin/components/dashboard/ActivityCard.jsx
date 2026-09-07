import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";

const API_URL = "/api";

const timeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const now = new Date();
  const past = new Date(dateStr);
  const diffInSec = Math.floor((now - past) / 1000);
  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatAction = (action = "") => {
  if (action.includes("CREATE")) return "CREATED";
  if (action.includes("PUBLISH")) return "PUBLISHED";
  if (action.includes("UPDATE") || action.includes("EDIT")) return "EDITED";
  if (action.includes("DELETE") || action.includes("REMOVE")) return "DELETED";
  if (action.includes("UPLOAD")) return "UPLOADED";
  return action.replace(/_/g, " ").toUpperCase();
};

const ActivityCard = ({ onOpenOverlay }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/audit-logs?limit=5`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setActivities(data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <DashboardCard
      eyebrow="Activity"
      action={
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      }
      className="min-h-[425px]"
      onClick={onOpenOverlay}
    >
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">
          Loading recent activities...
        </div>
      ) : activities.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400">
          No recent activity logged yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {activities.map((activity, index) => {
            const userName = activity.actor?.name || "System";
            const actionFormatted = formatAction(activity.action);
            const isDanger = actionFormatted === "DELETED";
            const itemName = activity.resourceName || activity.resourceType || "Content";

            return (
              <div
                key={activity._id || index}
                className="grid grid-cols-[64px_1fr] gap-4 py-4 first:pt-1 last:pb-0"
              >
                {/* TIME */}
                <div className="text-[11px] leading-4 text-gray-400">
                  {timeAgo(activity.createdAt)}
                </div>

                {/* ACTIVITY */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                      {userName}
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
                          isDanger
                            ? "border-red-200 text-red-500 bg-red-50/50"
                            : "border-gray-300 text-gray-600 bg-gray-50"
                        }
                      `}
                    >
                      {actionFormatted}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-gray-500 truncate font-medium">
                    {itemName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW ALL */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenOverlay?.();
          }}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View all activity →
        </button>
      </div>
    </DashboardCard>
  );
};

export default ActivityCard;