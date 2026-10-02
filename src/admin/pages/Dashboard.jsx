import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import WebsiteHealth from "../components/dashboard/WebsiteHealth";
import ContentOverview from "../components/dashboard/ContentOverview";
import ActivityCard from "../components/dashboard/ActivityCard";
import ActivityOverlay from "../components/dashboard/ActivityOverlay";
import ApprovalQueue from "../components/dashboard/ApprovalQueue";
import ApprovalOverlay from "../components/dashboard/ApprovalOverlay";
import StorageCard from "../components/dashboard/StorageCard";
import ServerStatus from "../components/dashboard/ServerStatus";
import SiteStructure from "../components/dashboard/SiteStructure";
import LargestContent from "../components/dashboard/LargestContent";
import Problems from "../components/dashboard/Problems";
import VisitorsCard from "../components/dashboard/VisitorsCard";
import AnalyticsOverlay from "../components/dashboard/AnalyticsOverlay";
import DatabaseCard from "../components/dashboard/DatabaseCard";
import SystemInfo from "../components/dashboard/SystemInfo";
import QuickActions from "../components/dashboard/QuickActions";
import Shortcuts from "../components/dashboard/Shortcuts";
import Deployments from "../components/dashboard/Deployments";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import CalendarOverlay from "../components/dashboard/CalendarOverlay";

const API_URL = "/api";

const Dashboard = () => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh metrics every 45 seconds
    const timer = setInterval(fetchStats, 45000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  return (
    <div className="max-w-[1400px] mx-auto w-full font-admin-sans space-y-6 pb-8" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* HEADER */}
      <DashboardHeader />

      {/* WEBSITE HEALTH */}
      <div>
        <WebsiteHealth stats={stats} loading={statsLoading} />
      </div>

      {/* ==========================================
          ROW 1
          CONTENT OVERVIEW + ACTIVITY
      ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
        <ContentOverview stats={stats} loading={statsLoading} />
        <ActivityCard
          onOpenOverlay={() => setActiveOverlay("activity")}
        />
      </div>

      {/* ==========================================
          ROW 2
          STORAGE + SERVER + APPROVALS
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-[1280px]:grid-cols-3 gap-5 mt-5">
        <StorageCard stats={stats} loading={statsLoading} />
        <ServerStatus stats={stats} loading={statsLoading} />
        <div className="md:col-span-2 min-[1280px]:col-span-1">
          <ApprovalQueue
            stats={stats}
            onOpen={() => setActiveOverlay("approvals")}
          />
        </div>
      </div>

      {/* ==========================================
          ROW 3
          SITE STRUCTURE + RIGHT SIDE
      ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-5 mt-5">
        <SiteStructure />
        <div className="space-y-5">
          <LargestContent stats={stats} loading={statsLoading} />
          <Problems stats={stats} loading={statsLoading} />
        </div>
      </div>

      {/* ==========================================
          ROW 4
          VISITORS + DATABASE + SYSTEM INFO
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-[1280px]:grid-cols-3 gap-5 mt-5">
        <VisitorsCard
          stats={stats}
          onOpenOverlay={() => setActiveOverlay("analytics")}
        />
        <DatabaseCard stats={stats} loading={statsLoading} />
        <div className="md:col-span-2 min-[1280px]:col-span-1">
          <SystemInfo stats={stats} loading={statsLoading} />
        </div>
      </div>

      {/* ==========================================
          ROW 5
          QUICK ACTIONS + SHORTCUTS + DEPLOYMENTS
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-[1280px]:grid-cols-3 gap-5 mt-5">
        <QuickActions
          onOpenCalendar={() => setActiveOverlay("calendar")}
        />
        <Shortcuts />
        <div className="md:col-span-2 min-[1280px]:col-span-1">
          <Deployments stats={stats} />
        </div>
      </div>

      {/* ==========================================
          ROW 6
          UPCOMING EVENTS & COLLEGE CALENDAR
      ========================================== */}
      <div className="mt-5">
        <UpcomingEvents
          key={eventsRefreshKey}
          onOpenCalendar={() => setActiveOverlay("calendar")}
        />
      </div>

      {/* ==========================================
          OVERLAYS
      ========================================== */}
      
      {/* COLLEGE CALENDAR & REMINDERS OVERLAY */}
      {activeOverlay === "calendar" && (
        <CalendarOverlay
          onClose={() => setActiveOverlay(null)}
          onEventUpdated={() => {
            setEventsRefreshKey((prev) => prev + 1);
            fetchStats();
          }}
        />
      )}

      {/* ACTIVITY OVERLAY */}
      {activeOverlay === "activity" && (
        <ActivityOverlay
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* APPROVAL OVERLAY */}
      {activeOverlay === "approvals" && (
        <ApprovalOverlay
          onClose={() => {
            setActiveOverlay(null);
            fetchStats();
          }}
        />
      )}

      {/* GOOGLE ANALYTICS OVERLAY */}
      {activeOverlay === "analytics" && (
        <AnalyticsOverlay
          onClose={() => {
            setActiveOverlay(null);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;