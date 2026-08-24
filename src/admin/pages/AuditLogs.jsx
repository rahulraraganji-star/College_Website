import { useEffect, useState } from "react";
import ChangeDiff from "../components/ChangeDiff";

const API_URL = "http://localhost:5000/api";

const ACTION_META = {
  USER_CREATED:   { label: "User Created",   color: "bg-green-100 text-green-700",   icon: "👤" },
  USER_UPDATED:   { label: "User Updated",   color: "bg-blue-100 text-blue-700",     icon: "✏️" },
  USER_DELETED:   { label: "User Deleted",   color: "bg-red-100 text-red-600",       icon: "🗑️" },
  ROLE_ASSIGNED:  { label: "Role Assigned",  color: "bg-purple-100 text-purple-700", icon: "🔑" },
  ROLE_CREATED:   { label: "Role Created",   color: "bg-green-100 text-green-700",   icon: "🏷️" },
  ROLE_UPDATED:   { label: "Role Updated",   color: "bg-blue-100 text-blue-700",     icon: "✏️" },
  ROLE_DELETED:   { label: "Role Deleted",   color: "bg-red-100 text-red-600",       icon: "🗑️" },
  PAGE_UPDATED:   { label: "Page Updated",   color: "bg-blue-100 text-blue-700",     icon: "📄" },
  PAGE_PUBLISHED: { label: "Page Published", color: "bg-green-100 text-green-700",   icon: "🚀" },
};

const RESOURCE_TYPES = ["user", "role", "page", "navigation"];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [actorSearch, setActorSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: opts.page ?? page,
        limit: 25,
        ...(actorSearch && { actor: actorSearch }),
        ...(actionFilter && { action: actionFilter }),
        ...(resourceTypeFilter && { resourceType: resourceTypeFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await fetch(`${API_URL}/audit-logs?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load audit logs.");
      setLogs(data.logs || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchLogs({ page: 1 }); }, [actorSearch, actionFilter, resourceTypeFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setActorSearch(""); setActionFilter("");
    setResourceTypeFilter(""); setDateFrom(""); setDateTo("");
  };

  const hasFilters = actorSearch || actionFilter || resourceTypeFilter || dateFrom || dateTo;

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Workflows</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          A complete, permanent record of every change made in the CMS.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search by person</label>
          <input type="text" placeholder="Name or email..." value={actorSearch}
            onChange={(e) => setActorSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action type</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900">
            <option value="">All actions</option>
            {Object.entries(ACTION_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={resourceTypeFilter} onChange={(e) => setResourceTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900">
            <option value="">All categories</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From date</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To date</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-gray-700 pb-0.5">
            ✕ Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading audit log...</div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No entries found.</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const meta = ACTION_META[log.action] || { label: log.action, color: "bg-gray-100 text-gray-600", icon: "•" };
            const isExpanded = expandedId === log._id;
            const hasDiff = log.before || log.after;

            return (
              <div key={log._id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="text-lg flex-shrink-0 select-none">{meta.icon}</span>
                  <span className={["rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0", meta.color].join(" ")}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {log.resourceName || log.resourceId || "—"}
                      <span className="font-normal text-gray-400"> — {log.resourceType}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by <span className="font-medium text-gray-600">{log.actor?.name || "System"}</span>
                      {log.actor?.email && <span> ({log.actor.email})</span>}
                      {" · "}
                      {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {hasDiff && (
                    <button type="button"
                      onClick={() => setExpandedId(isExpanded ? null : log._id)}
                      className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      {isExpanded ? "Hide ▲" : "See changes ▼"}
                    </button>
                  )}
                </div>
                {isExpanded && hasDiff && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">
                    <ChangeDiff before={log.before} after={log.after} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">{pagination.total} entr{pagination.total !== 1 ? "ies" : "y"}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchLogs({ page: p }); }}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40">
              ← Previous
            </button>
            <span className="text-xs text-gray-500">{page} / {pagination.pages}</span>
            <button type="button" disabled={page >= pagination.pages}
              onClick={() => { const p = page + 1; setPage(p); fetchLogs({ page: p }); }}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
