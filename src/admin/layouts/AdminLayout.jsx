import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import LoadingScreen from "../../Components/LoadingScreen";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-admin-sans" style={{ fontFamily: "var(--sans)" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />

        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<LoadingScreen fullScreen={false} text="Loading..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;