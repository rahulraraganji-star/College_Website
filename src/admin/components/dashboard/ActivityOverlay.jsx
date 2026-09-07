import { useState, useEffect } from "react";

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
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatAction = (action = "") => {
  if (action.includes("CREATE")) return "CREATED";
  if (action.includes("PUBLISH")) return "PUBLISHED";
  if (action.includes("UPDATE") || action.includes("EDIT")) return "EDITED";
  if (action.includes("DELETE") || action.includes("REMOVE")) return "DELETED";
  if (action.includes("UPLOAD")) return "UPLOADED";
  return action.replace(/_/g, " ").toUpperCase();
};

const ActivityOverlay = ({ onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/audit-logs?limit=50`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setActivities(data.logs);
        }
      } catch (err) {
        console.error("Failed to load activity overlay logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close activity"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      {/* OVERLAY */}
      <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 shrink-0">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Audit Stream
            </div>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Activity History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent recorded activity across all CMS resources.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">
              Loading activity logs...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">
              No activity records found.
            </div>
          ) : (
            activities.map((activity, index) => {
              const userName = activity.actor?.name || "System";
              const userEmail = activity.actor?.email ? ` (${activity.actor.email})` : "";
              const actionFormatted = formatAction(activity.action);
              const isDanger = actionFormatted === "DELETED";
              const resourceTitle = activity.resourceName || activity.resourceType || "CMS Resource";

              return (
                <div
                  key={activity._id || index}
                  className="grid grid-cols-[110px_1fr] gap-6 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors rounded-lg"
                >
                  {/* TIME */}
                  <div className="text-xs text-gray-400 pt-0.5">
                    {timeAgo(activity.createdAt)}
                  </div>

                  {/* DETAILS */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {userName}
                        <span className="text-xs font-normal text-gray-400">{userEmail}</span>
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
                            isDanger
                              ? "border-red-200 text-red-600 bg-red-50"
                              : "border-gray-300 text-gray-600 bg-gray-50"
                          }
                        `}
                      >
                        {actionFormatted}
                      </span>

                      <span className="text-xs text-gray-400">
                        on <span className="capitalize text-gray-600 font-medium">{activity.resourceType || "resource"}</span>
                      </span>
                    </div>

                    <div className="mt-1 text-sm font-medium text-gray-800">
                      {resourceTitle}
                    </div>

                    {activity.details && (
                      <div className="mt-1 text-xs text-gray-500">
                        {activity.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityOverlay;