import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Staff = () => {
  return (
    <section>
      <p className="text-gray-600 mb-8">
        Our institution is supported by dedicated teaching and non-teaching staff
        committed to academic excellence and student development.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/staff/faculty"
          className="flex items-center gap-4 p-6 bg-white border rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#F5B301]">
            <Users size={18} />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Teaching Faculty</h3>
            <p className="text-sm text-gray-500">View details</p>
          </div>
        </Link>

        <Link
          to="/staff/non-teaching"
          className="flex items-center gap-4 p-6 bg-white border rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#F5B301]">
            <Users size={18} />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Non-Teaching Staff</h3>
            <p className="text-sm text-gray-500">View details</p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Staff;
