import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-5 font-bold text-xl">
        CMS
      </div>

      <nav className="flex flex-col">
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/pages">Pages</NavLink>
        <NavLink to="/admin/navigation">Navigation</NavLink>
        <NavLink to="/admin/media">Media</NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;