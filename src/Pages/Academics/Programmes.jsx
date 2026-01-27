import { Link } from "react-router-dom";

const Programmes = () => {
  const programmes = [
    { code: "ba", name: "Bachelor of Arts" },
    { code: "bcom", name: "Bachelor of Commerce" },
    { code: "bca", name: "Bachelor of Computer Applications" },
  ];

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-6">
        Programmes & Courses
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programmes.map((p) => (
          <Link
            key={p.code}
            to={`/academics/${p.code}`}
            className="
              border rounded-xl p-6 bg-white
              hover:shadow-lg transition
              text-center
            "
          >
            <h3 className="text-xl font-semibold mb-2">
              {p.name}
            </h3>
            <span className="text-sm text-gray-600">
              View programme →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Programmes;
