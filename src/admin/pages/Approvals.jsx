import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChangeDiff from "../components/ChangeDiff";
import LoadingScreen from "../../Components/LoadingScreen";

const API_URL = "/api";

const TABS = [
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All"      },
];

const STATUS_STYLE = {
  pending:  "bg-yellow-100 text-yellow-700 border border-yellow-300",
  approved: "bg-green-100 text-green-700 border border-green-300",
  rejected: "bg-red-100 text-red-600 border border-red-300",
};

const Approvals = () => {
  const [searchParams] = useSearchParams();
  const targetIdFromUrl = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("pending");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [expandedId, setExpandedId] = useState(targetIdFromUrl || null);
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
    // If a specific ID is passed in URL query param, switch to 'all' tab if not found in pending
    if (targetIdFromUrl) {
      setActiveTab("all");
      setExpandedId(targetIdFromUrl);
    }
  }, [targetIdFromUrl]);

  useEffect(() => {
    setPage(1);
    fetchApprovals({ status: activeTab, page: 1 });
  }, [activeTab]);

  // ==========================================
  // APPROVE (FIRST DECISION WINS)
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
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to approve request.");
      }
      fetchApprovals();
    } catch (err) {
      setActionError(err.message);
      fetchApprovals(); // Refresh state to show latest decision
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // REJECT (REQUIRED REASON)
  // ==========================================

  const handleReject = async () => {
    if (!rejectTarget) return;
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setActionError("A rejection reason is required. Please explain why the change was rejected.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/approvals/${rejectTarget}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: trimmedReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reject request.");
      }
      setRejectTarget(null);
      setRejectReason("");
      fetchApprovals();
    } catch (err) {
      setActionError(err.message);
      fetchApprovals(); // Refresh state to show latest decision
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
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">Workflows</p>
        <h1 className="text-[28px] font-extrabold text-black tracking-tight">Approval Queue</h1>
        <p className="text-[14px] text-neutral-500 mt-1.5">
          Review and action content change requests before they go live. First valid decision by any authorized administrator is final.
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

      {/* ACTION & SYSTEM ALERTS */}
      {actionError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError("")} className="text-red-500 hover:text-red-800 text-xs">✕</button>
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
          <LoadingScreen fullScreen={false} text="Loading approvals..." />
        ) : approvals.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
            No {activeTab !== "all" ? activeTab : ""} approval requests found.
          </div>
        ) : (
          approvals.map((approval) => {
            const isExpanded = expandedId === approval._id;
            const hasDiff = approval.before || approval.after;

            return (
              <div
                key={approval._id}
                id={`approval-${approval._id}`}
                className={[
                  "rounded-xl border bg-white overflow-hidden transition-all",
                  expandedId === approval._id ? "border-gray-900 shadow-sm" : "border-gray-200",
                ].join(" ")}
              >

                {/* ROW HEADER */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={[
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 uppercase tracking-wide",
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
                          {approval.submittedBy?.name || "Unknown User"}
                        </span>
                        {approval.submittedBy?.department && (
                          <span> ({approval.submittedBy.department})</span>
                        )}
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
                        {isExpanded ? "Hide Details ▲" : "Review Changes ▼"}
                      </button>
                    )}

                    {/* APPROVE / REJECT (ONLY SHOWN WHEN PENDING) */}
                    {approval.status === "pending" && (
                      <>
                        <button type="button" disabled={actionLoading}
                          onClick={() => handleApprove(approval._id)}
                          className="rounded-md bg-green-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition">
                          Approve
                        </button>
                        <button type="button" disabled={actionLoading}
                          onClick={() => { setRejectTarget(approval._id); setRejectReason(""); setActionError(""); }}
                          className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* CHANGES PANEL — human-readable diff */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/70">

                    {/* REVIEW STATUS BANNER (FOR CLOSED / PROCESSED REQUESTS) */}
                    {approval.status !== "pending" && (
                      <div className={[
                        "mb-4 rounded-lg p-3.5 border text-xs flex items-center justify-between",
                        approval.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900",
                      ].join(" ")}>
                        <div>
                          <p className="font-bold">
                            {approval.status === "approved" ? "✅ This request was approved and published." : "❌ This request was rejected."}
                          </p>
                          <p className="mt-0.5 text-[11px] opacity-80">
                            Reviewed by <strong>{approval.reviewedBy?.name || approval.reviewedByRole || "Administrator"}</strong> on{" "}
                            {new Date(approval.reviewedAt).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                        {approval.reviewComment && (
                          <div className="max-w-xs text-right">
                            <span className="font-semibold block text-[10px] uppercase tracking-wider">Note:</span>
                            <span className="italic">"{approval.reviewComment}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {hasDiff && (
                      <ChangeDiff before={approval.before} after={approval.after} />
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
              Please enter the reason for rejection. This exact feedback will be emailed to the submitter so they can make corrections.
            </p>

            {actionError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please update the committee list to reflect the latest 2026 guidelines and re-upload the document."
              rows={4}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button type="button"
                onClick={() => { setRejectTarget(null); setActionError(""); setRejectReason(""); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={handleReject}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
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
