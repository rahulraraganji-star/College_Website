import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = ({ onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDayDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/admin/pages?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Admin";

  return (
    <div className="mb-7">
      {/* Heading */}
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-2">
            Overview
          </div>

          <h1 className="text-[28px] font-extrabold text-black tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1.5 text-[14px] text-neutral-500">
            Welcome back, <span className="font-semibold text-gray-800">{firstName}</span> — here's what's happening across the site right now.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <div className="text-[11px] text-gray-400 font-medium">
            {formattedDayDate}
          </div>

          <div className="mt-1 text-sm font-semibold text-gray-800 font-mono tracking-tight">
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center h-12 px-4 border border-gray-300 rounded-full bg-white shadow-xs focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all">
        <Search
          size={17}
          strokeWidth={1.7}
          className="text-gray-400 shrink-0"
        />

        <input
          id="dashboard-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search pages, media, users, navigation..."
          className="
            flex-1
            min-w-0
            ml-3
            bg-transparent
            outline-none
            text-sm
            text-gray-800
            placeholder:text-gray-400
          "
        />

        <div className="hidden sm:flex items-center justify-center h-7 px-2.5 border border-gray-200 rounded-md text-[11px] font-mono text-gray-500 bg-gray-50">
          ⌘K
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;