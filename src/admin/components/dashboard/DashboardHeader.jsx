import { Search } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="mb-7">
      {/* Heading */}
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-2">
            Overview
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Welcome back — here's what's happening across the site right now.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <div className="text-[11px] text-gray-400">
            Sunday, August 17
          </div>

          <div className="mt-1 text-sm font-medium text-gray-800">
            4:12 PM
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center h-12 px-4 border border-gray-300 rounded-full bg-white">
        <Search
          size={17}
          strokeWidth={1.7}
          className="text-gray-400 shrink-0"
        />

        <input
          type="text"
          placeholder="Search pages, media, users, settings..."
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

        <div className="hidden sm:flex items-center justify-center h-7 px-2.5 border border-gray-200 rounded-md text-[11px] text-gray-500">
          ⌘K
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;