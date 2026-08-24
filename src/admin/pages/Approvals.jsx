import { useEffect, useState } from "react";
import ChangeDiff from "../components/ChangeDiff";

const API_URL = "http://localhost:5000/api";

const TABS = [
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All"      },
];

const STATUS_STYLE = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const Approvals = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");


  // ==========================================
  // FETCH
  // ==========================================

  const fetchApprovals = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: opts.status ?? activeTab,
        page:   opts.page   ?? page,
        limit:  15,
      });
      const res = await fetch(`${API_URL}/approvals?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load approvals.");
      setApprovals(data.approvals || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
    fetchApprovals({ status: activeTab, page: 1 });
  }, [activeTab]);


  // ==========================================
  // APPROVE
  // ==========================================

  const handleApprove = async (approvalId) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/approvals/${approvalId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to approve.");
      fetchApprovals();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================
  // REJECT
  // ==========================================

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { setActionError("A rejection reason is required."); return; }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/approvals/${rejectTarget}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reject.");
      setRejectTarget(null);
      setRejectReason("");
      fetchApprovals();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Workflows</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Approval Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and action content change requests before they go live.
        </p>
      </div>


      {/* TABS */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
            className={[
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}>
            {tab.label}
          </button>
        ))}
      </div>


      {/* ERRORS */}
      {actionError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading approvals...</div>
        ) : approvals.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No {activeTab !== "all" ? activeTab : ""} approval requests.
          </div>
        ) : (
          approvals.map((approval) => {
            const isExpanded = expandedId === approval._id;
            const hasDiff = approval.before || approval.after;

            return (
              <div key={approval._id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">

                {/* ROW HEADER */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={[
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0",
                      STATUS_STYLE[approval.status] || STATUS_STYLE.pending,
                    ].join(" ")}>
                      {approval.status}
                    </span>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {approval.resourceName || approval.resourceType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-semibold text-gray-600 uppercase text-[10px]">
                          {approval.action}
                        </span>
                        {" · "}
                        Submitted by{" "}
                        <span className="font-medium text-gray-600">
                          {approval.submittedBy?.name || "Unknown"}
                        </span>
                        {" · "}
                        {new Date(approval.createdAt).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* VIEW CHANGES BUTTON */}
                    {hasDiff && (
                      <button type="button"
                        onClick={() => setExpandedId(isExpanded ? null : approval._id)}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        {isExpanded ? "Hide ▲" : "View changes ▼"}
                      </button>
                    )}

                    {/* APPROVE / REJECT */}
                    {approval.status === "pending" && (
                      <>
                        <button type="button" disabled={actionLoading}
                          onClick={() => handleApprove(approval._id)}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                          Approve
                        </button>
                        <button type="button" disabled={actionLoading}
                          onClick={() => { setRejectTarget(approval._id); setRejectReason(""); setActionError(""); }}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>


                {/* CHANGES PANEL — human-readable diff */}
                {isExpanded && hasDiff && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">
                      Proposed Changes
                    </p>

                    <ChangeDiff before={approval.before} after={approval.after} />

                    {/* REVIEW INFO (for non-pending) */}
                    {approval.status !== "pending" && approval.reviewedBy && (
                      <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">
                            {approval.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                          </span>
                          {" by "}
                          <span className="font-medium">{approval.reviewedBy.name}</span>
                          {" on "}
                          {new Date(approval.reviewedAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                        {approval.reviewComment && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{approval.reviewComment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>


      {/* PAGINATION */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-gray-400">
            {pagination.total} request{pagination.total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchApprovals({ page: p }); }}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40">
              ← Previous
            </button>
            <span className="text-xs text-gray-500">{page} / {pagination.pages}</span>
            <button type="button" disabled={page >= pagination.pages}
              onClick={() => { const p = page + 1; setPage(p); fetchApprovals({ page: p }); }}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}


      {/* REJECT REASON MODAL */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Reject Request</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please explain why this change is being rejected. The submitter will see this reason.
            </p>

            {actionError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The page content doesn't follow our style guide. Please revise and resubmit."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button type="button"
                onClick={() => { setRejectTarget(null); setActionError(""); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" disabled={actionLoading} onClick={handleReject}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Approvals;
