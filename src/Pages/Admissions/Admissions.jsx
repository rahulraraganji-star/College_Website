import { Link } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  ListChecks,
  Bell,
  RotateCcw,
} from "lucide-react";

const cards = [
  { label: "e-Prospectus", href: "/admissions/prospectus", icon: FileText },
  { label: "Documents Required", href: "/admissions/documents", icon: ClipboardCheck },
  { label: "Merit Lists", href: "/admissions/merit-list", icon: ListChecks },
  { label: "Admission Notices", href: "/admissions/notices", icon: Bell },
  { label: "Fee Refund Policy", href: "/admissions/refund-policy", icon: RotateCcw },
];

const Admissions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((c) => (
        <Link
          key={c.label}
          to={c.href}
          className="flex items-start gap-4 p-6 bg-white border rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#F5B301]">
            <c.icon size={18} />
          </div>
          <div>
            <h3 className="font-semibold">{c.label}</h3>
            <p className="text-sm text-gray-500">View details</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Admissions;
