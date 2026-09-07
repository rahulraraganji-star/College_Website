import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const ApprovalOverlay = ({ onClose }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`${API_URL}/approvals?status=pending&limit=30`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.approvals)) {
        setRequests(data.approvals);
      }
    } catch (err) {
      setErrorMsg("Failed to load approval requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setFeedbackMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/approvals/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: "Approved from dashboard" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to approve.");
      setFeedbackMsg("Change approved successfully.");
      fetchApprovals();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    setActionLoading(true);
    setFeedbackMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/approvals/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reject.");
      setFeedbackMsg("Change rejected.");
      fetchApprovals();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close approval queue"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      {/* OVERLAY */}
      <div className="relative z-10 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 shrink-0">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Workflows
            </div>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Pending Approval Queue
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Content and page changes waiting for administrator approval.
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

        {/* ALERTS */}
        {feedbackMsg && (
          <div className="mx-7 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            {feedbackMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-7 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* REQUESTS */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">
              Loading pending requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-gray-700">No pending approval requests</p>
              <p className="text-xs text-gray-400 mt-1">All proposed changes have been reviewed and processed.</p>
            </div>
          ) : (
            requests.map((request) => {
              const submitterName = request.submittedBy?.name || "Editor";
              const department = request.submittedByDepartment || request.submittedBy?.department || "General";
              const resourceTitle = request.resourceName || request.resourceType;
              const actionLabel = (request.action || "UPDATE").toUpperCase();

              return (
                <div
                  key={request._id}
                  className="px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors rounded-lg"
                >
                  <div className="flex items-start justify-between gap-6">

                    {/* LEFT */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {resourceTitle}
                        </span>

                        <span className="rounded-md border border-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50">
                          {actionLabel}
                        </span>

                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>

                      <div className="mt-1.5 text-xs text-gray-500 capitalize">
                        {request.resourceType} · {department}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        Submitted by <span className="font-medium text-gray-600">{submitterName}</span> ·{" "}
                        {timeAgo(request.createdAt)}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("/admin/approvals");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Inspect
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleReject(request._id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApprove(request._id)}
                        className="px-3 py-1.5 rounded-lg bg-gray-900 text-xs font-medium text-white hover:bg-black disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="px-7 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            {requests.length} pending item{requests.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/admin/approvals");
            }}
            className="text-xs font-semibold text-gray-900 hover:underline"
          >
            Open Approvals Workspace →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalOverlay;