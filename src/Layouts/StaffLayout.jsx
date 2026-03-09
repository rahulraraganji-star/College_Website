import { NavLink, Outlet } from "react-router-dom";
import {
  UsersIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const StaffLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Professional Header */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Staff Directory</h1>
              <p className="text-sm text-gray-500 mt-1">Faculty and Administrative Staff Management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          {/* Navigation */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0 lg:pr-8 lg:border-r lg:border-gray-200">
            <nav className="space-y-1">
              <NavLink
                to="/staff/faculty"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <UsersIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                Teaching Faculty
              </NavLink>

              <NavLink
                to="/staff/non-teaching"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <UserGroupIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                Non-Teaching Staff
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 lg:p-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;
