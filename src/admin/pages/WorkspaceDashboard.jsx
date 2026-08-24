import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:5000/api";

// ==========================================
// SCOPE → DISPLAY LABEL
// ==========================================

const formatScope = (scope) => {
  if (scope.startsWith("home:")) {
    const section = scope.replace("home:", "");
    return {
      label: "Home — " + section
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      href: "/admin/home",
      type: "home-section",
    };
  }

  return {
    label: scope
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    href: `/admin/pages?section=${scope}`,
    type: "page",
  };
};

// ==========================================
// WORKSPACE DASHBOARD
// ==========================================

const WorkspaceDashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [myPages, setMyPages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allowed = (user?.allowedPages || []).filter((p) => p !== "*");
    setMyPages(allowed.map(formatScope));
    fetchPendingCount();
    setLoading(false);
  }, [user]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`${API_URL}/approvals?status=pending&limit=1`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setPendingCount(data.pagination?.total || 0);
    } catch {
      // optional
    }
  };

  const canViewApprovals  = hasPermission("approvals.view");
  const canApprove        = hasPermission("approvals.approve");
  const canEdit           = hasPermission("pages.edit");
  const canCreate         = hasPermission("pages.create");
  const canPublish        = hasPermission("pages.publish");
  const canSubmit         = hasPermission("approvals.submit");

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 lg:px-8 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* HEADER */}
      <div className="mb-8 pb-6 border-b border-neutral-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          My Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {user?.roleId?.name || "CMS User"}
          {myPages.length > 0
            ? ` · ${myPages.length} resource${myPages.length !== 1 ? "s" : ""} assigned`
            : " · No resources assigned yet"}
        </p>
      </div>


      {/* PENDING APPROVALS BANNER */}
      {canViewApprovals && pendingCount > 0 && (
        <div
          onClick={() => navigate("/admin/approvals")}
          className="mb-6 flex items-center justify-between rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-4 cursor-pointer hover:bg-black transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-white text-base">⏳</span>
            <div>
              <p className="text-sm font-semibold text-white">
                {pendingCount} pending approval{pendingCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-neutral-400">
                {canApprove ? "Review submissions" : "Awaiting Admin review"}
              </p>
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-medium">View →</span>
        </div>
      )}


      {/* MY RESOURCES */}
      <div className="mb-8">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
          My Resources
        </p>

        {myPages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 py-14 text-center">
            <p className="text-sm text-neutral-400">No pages assigned.</p>
            <p className="text-xs text-neutral-300 mt-1">
              Contact your Administrator to grant access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPages.map((page, i) => (
              <ResourceCard
                key={i}
                page={page}
                canEdit={canEdit}
                canCreate={canCreate}
                canPublish={canPublish}
                canSubmit={canSubmit}
                onClick={() => navigate(page.href)}
              />
            ))}
          </div>
        )}
      </div>


      {/* MY PERMISSIONS SUMMARY */}
      <div className="rounded-xl border border-neutral-200 p-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
          My Permissions
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "pages.view",        label: "View Pages" },
            { key: "pages.edit",        label: "Edit Pages" },
            { key: "pages.create",      label: "Create Pages" },
            { key: "pages.delete",      label: "Delete Pages" },
            { key: "pages.publish",     label: "Publish (bypass approval)" },
            { key: "approvals.submit",  label: "Submit for Approval" },
            { key: "approvals.view",    label: "View Approvals" },
            { key: "approvals.approve", label: "Approve Changes" },
            { key: "media.view",        label: "View Media" },
            { key: "media.upload",      label: "Upload Media" },
          ].map(({ key, label }) => {
            const has = hasPermission(key);
            return (
              <span
                key={key}
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-medium border",
                  has
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-300 border-neutral-200 line-through",
                ].join(" ")}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// RESOURCE CARD
// ==========================================

const ResourceCard = ({ page, canEdit, canCreate, canPublish, canSubmit, onClick }) => (
  <div
    onClick={onClick}
    className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 cursor-pointer hover:border-neutral-900 hover:shadow-sm transition-all"
  >
    <div className="min-w-0">
      <p className="font-semibold text-neutral-900 text-sm truncate">{page.label}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {canEdit && (
          <Badge label="Edit" />
        )}
        {canCreate && (
          <Badge label="Create" />
        )}
        {canSubmit && !canPublish && (
          <Badge label="Submit for Approval" />
        )}
        {canPublish && (
          <Badge label="Publish" dark />
        )}
      </div>
    </div>
    <span className="text-neutral-300 group-hover:text-neutral-900 transition-colors ml-4 text-lg flex-shrink-0">
      →
    </span>
  </div>
);

const Badge = ({ label, dark = false }) => (
  <span className={[
    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    dark
      ? "bg-neutral-900 text-white"
      : "bg-neutral-100 text-neutral-600",
  ].join(" ")}>
    {label}
  </span>
);

export default WorkspaceDashboard;
