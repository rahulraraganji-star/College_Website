import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const AdminTopbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-6">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        <h1 className="text-black text-[17px] font-bold tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* System Status */}
        <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-medium uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          System Normal
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200" />

        {/* User */}
        <div className="flex items-center gap-3">
          
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-neutral-900">
              {user?.name || "Admin"}
            </p>

            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              {user?.role || "Admin"}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
            <User size={15} />
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 transition"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>

        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;