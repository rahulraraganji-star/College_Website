import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

const Navbar = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRefs = useRef({});

  useEffect(() => {
    fetch("http://localhost:5000/api/navigation")
      .then((res) => res.json())
      .then((data) => {
        setMenus(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("NAV FETCH ERROR:", err);
        setMenus([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <nav className="bg-white border-b h-[64px]" />;
  }

  // 🔥 Safe absolute path generator
  const buildPath = (slug) => {
    if (!slug) return "/";
    const cleaned = slug.replace(/^\/+/, ""); // remove leading slashes
    return `/${cleaned}`;
  };

  const positionDropdown = (index, isAbout) => {
    const el = dropdownRefs.current[index];
    if (!el) return;

    const vw = window.innerWidth;

    el.style.left = "0";
    el.style.right = "auto";
    el.style.transform = "translateX(0)";

    if (isAbout) {
      el.style.left = "50%";
      el.style.transform = "translateX(-50%)";
    }

    let rect = el.getBoundingClientRect();

    if (rect.right > vw - 16) {
      el.style.left = "auto";
      el.style.right = "0";
      el.style.transform = "translateX(0)";
    }

    rect = el.getBoundingClientRect();

    if (rect.left < 16) {
      el.style.left = "0";
      el.style.right = "auto";
      el.style.transform = "translateX(0)";
    }
  };

  return (
    <nav className="bg-white border-b font-jaini">
      <div className="max-w-7xl mx-auto px-10">
        <ul className="flex items-center justify-between w-full">
          {menus.map((menu, index) => {
            const isAbout = menu.title === "About Us";
            const hasChildren = menu.items && menu.items.length > 0;

            return (
              <li
                key={menu._id || index}
                className="relative group"
                onMouseEnter={
                  hasChildren
                    ? () => positionDropdown(index, isAbout)
                    : undefined
                }
              >
                {/* TOP LEVEL */}
                {hasChildren ? (
                  <span className="block py-4 text-sm font-semibold tracking-wide cursor-pointer hover:text-[#F5B301] whitespace-nowrap">
                    {menu.title}
                  </span>
                ) : (
                  <Link
                    to={buildPath(menu.slug || menu.key)}
                    className="block py-4 text-sm font-semibold tracking-wide hover:text-[#F5B301] whitespace-nowrap"
                  >
                    {menu.title}
                  </Link>
                )}

                {/* DROPDOWN */}
                {hasChildren && (
                  <div
                    ref={(el) => (dropdownRefs.current[index] = el)}
                    className="absolute top-full z-50 invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto"
                  >
                    <div className="mt-3 bg-[#F9FAFB] border border-gray-300 rounded-xl shadow-xl p-6 w-[820px] max-w-[90vw] scale-95 group-hover:scale-100 transition-transform">
                      
                      {isAbout ? (
                        <div className="flex gap-8">
                          <Link
                            to="/about/history"
                            className="w-[170px] border border-[#F5B301] rounded-lg p-4 bg-white flex flex-col justify-between"
                          >
                            <h3 className="text-sm font-semibold mb-2">
                              About Our Institution
                            </h3>
                            <p className="text-xs text-gray-600">
                              Learn about our legacy and values.
                            </p>
                            <span className="mt-4 text-xs font-semibold">
                              Explore More →
                            </span>
                          </Link>

                          <div className="grid grid-cols-2 gap-6">
                            {menu.items.map((item) => {
                              const Icon = Icons[item.icon] || null;

                              return (
                                <Link
                                  key={item._id}
                                  to={buildPath(item.slug)}
                                  className="flex gap-3"
                                >
                                  <div className="w-8 h-8 bg-[#FFF4D6] rounded-full flex items-center justify-center text-[#F5B301]">
                                    {Icon && <Icon size={16} />}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold">
                                      {item.label}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      View details
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-6">
                          {menu.items.map((item) => {
                            const Icon = Icons[item.icon] || null;

                            return (
                              <Link
                                key={item._id}
                                to={buildPath(item.slug)}
                                className="flex gap-3"
                              >
                                <div className="w-8 h-8 bg-[#FFF4D6] rounded-full flex items-center justify-center text-[#F5B301]">
                                  {Icon && <Icon size={16} />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold">
                                    {item.label}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    View details
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;