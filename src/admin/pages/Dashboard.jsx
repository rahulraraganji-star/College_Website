import { useState } from "react";
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
import DatabaseCard from "../components/dashboard/DatabaseCard";
import SystemInfo from "../components/dashboard/SystemInfo";
import QuickActions from "../components/dashboard/QuickActions";
import Shortcuts from "../components/dashboard/Shortcuts";
import Deployments from "../components/dashboard/Deployments";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import CreateUserOverlay from "../components/dashboard/CreateUserOverlay";
import UserManagementOverlay from "../components/dashboard/UserManagementOverlay.jsx";
import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  
  const {
    user,
    loading,
    hasPermission,
    hasPageAccess,
  } = useAuth();

  console.log("CURRENT USER:", user);
  console.log(
    "CAN EDIT PAGES:",
    hasPermission("pages.edit")
  );
  console.log(
    "CAN ACCESS LIBRARY:",
    hasPageAccess("library")
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
      {/* HEADER */}
      <DashboardHeader />

      {/* WEBSITE HEALTH */}
      <div className="space-y-6">
        <WebsiteHealth />
      </div>

      {/* ==========================================
          ROW 1
          CONTENT OVERVIEW + ACTIVITY
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <ContentOverview />
        <ActivityCard
          onOpenOverlay={() => setActiveOverlay("activity")}
        />
      </div>

      {/* ==========================================
          ROW 2
          STORAGE + SERVER + APPROVALS
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <StorageCard />
        <ServerStatus />
        <ApprovalQueue
          onOpen={() => setActiveOverlay("approvals")}
        />
      </div>

      {/* ==========================================
          ROW 3
          SITE STRUCTURE + RIGHT SIDE
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-5 mt-5">
        <SiteStructure />
        <div className="space-y-5">
          <LargestContent />
          <Problems />
        </div>
      </div>

      {/* ==========================================
          ROW 4
          VISITORS + DATABASE + SYSTEM INFO
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <VisitorsCard />
        <DatabaseCard />
        <SystemInfo />
      </div>

      {/* ==========================================
          ROW 5
          QUICK ACTIONS + SHORTCUTS + DEPLOYMENTS
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <QuickActions
          onCreateUser={() => setActiveOverlay("create-user")}
          onManageUsers={() => setActiveOverlay("manage-users")}
        />
        <Shortcuts />
        <Deployments />
      </div>

      {/* ==========================================
          ROW 6
          UPCOMING EVENTS
      ========================================== */}
      <div className="mt-5">
        <UpcomingEvents />
      </div>

      {/* ==========================================
          OVERLAYS
      ========================================== */}
      
      {/* ACTIVITY OVERLAY */}
      {activeOverlay === "activity" && (
        <ActivityOverlay
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* APPROVAL OVERLAY */}
      {activeOverlay === "approvals" && (
        <ApprovalOverlay
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* CREATE USER OVERLAY */}
      {activeOverlay === "create-user" && (
        <CreateUserOverlay
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* MANAGE USERS OVERLAY */}
      {activeOverlay === "manage-users" && (
        <UserManagementOverlay
          onClose={() => setActiveOverlay(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;