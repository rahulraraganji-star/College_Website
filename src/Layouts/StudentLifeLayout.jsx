import { Outlet, NavLink } from "react-router-dom";
import {
  LifeBuoy,
  Users,
  UserRound,
  GraduationCap,
  Sparkles,
  Trophy,
  Briefcase,
  HeartHandshake,
  Award
} from "lucide-react";

const StudentLifeLayout = () => {

const linkClass = ({ isActive }) =>
  `relative flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all
  ${
    isActive
      ? "bg-[#E8DDC6] text-black font-medium"
      : "text-gray-700 hover:bg-[#EEE6D6]"
  }`;

  const iconStyle = "w-5 h-5 text-[#8B7355]";

  return (
    <section className="bg-[#F4F6F8] min-h-screen py-16">

      {/* Main surface */}
      <div className="max-w-[1280px] mx-auto bg-white rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.06)] overflow-hidden">

        <div className="flex">

          {/* Sidebar */}
         <aside className="w-[280px] bg-[#F7F3EA] px-8 py-10 border-r border-[#E5E5E5]">

            <h1 className="text-[28px] font-semibold mb-8 tracking-tight">
              Student Life
            </h1>

            <div className="border-b border-[#E6E6E6] mb-6"></div>

            <nav className="flex flex-col gap-1 text-[15px]">

              <NavLink to="/student-life/support" className={linkClass}>
                <LifeBuoy className={iconStyle} />
                Student Support Services
              </NavLink>

              <NavLink to="/student-life/clubs" className={linkClass}>
                <Users className={iconStyle} />
                Clubs & Cells
              </NavLink>

              <NavLink to="/student-life/council" className={linkClass}>
                <UserRound className={iconStyle} />
                Student Council
              </NavLink>

              <NavLink to="/student-life/ncc" className={linkClass}>
                <GraduationCap className={iconStyle} />
                NCC
              </NavLink>

              <NavLink to="/student-life/nss" className={linkClass}>
                <Sparkles className={iconStyle} />
                NSS
              </NavLink>

              <NavLink to="/student-life/sports" className={linkClass}>
                <Trophy className={iconStyle} />
                Sports Facilities
              </NavLink>

              <NavLink to="/student-life/placements" className={linkClass}>
                <Briefcase className={iconStyle} />
                Placements & Internships
              </NavLink>

              <NavLink to="/student-life/counselling" className={linkClass}>
                <HeartHandshake className={iconStyle} />
                Counselling
              </NavLink>

              <NavLink to="/student-life/awards" className={linkClass}>
                <Award className={iconStyle} />
                Awards & Scholarships
              </NavLink>

            </nav>

            <div className="border-t border-[#E6E6E6] mt-10"></div>

          </aside>

          {/* Content */}
          <main className="flex-1 bg-[#F4F6F8] px-12 py-12">

            <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-10 max-w-[920px]">

              <Outlet />

            </div>

          </main>

        </div>

      </div>

    </section>
  );
};

export default StudentLifeLayout;