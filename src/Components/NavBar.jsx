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

  const buildPath = (slug) => {
    if (!slug) return "/";
    const cleaned = slug.replace(/^\/+/, "");
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

                      {/* ABOUT US SPECIAL LAYOUT */}
                      {isAbout ? (
                        <div className="flex gap-10 items-start">

                          {/* LEFT FEATURE CARD */}
                          <Link
                            to="/about/history"
                            className="w-[190px] border border-[#F5B301] rounded-xl p-6 bg-white flex flex-col justify-between min-h-[220px]"
                          >
                            <div>
                              <h3 className="text-[15px] font-semibold mb-6">
                                About Our Institution
                              </h3>

                              <p className="text-sm text-gray-600 leading-relaxed">
                                Learn about our legacy
                                <br />
                                and values.
                              </p>
                            </div>

                            <span className="text-sm font-semibold mt-8">
                              Explore More →
                            </span>
                          </Link>

                          {/* RIGHT ITEMS */}
                          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                            {menu.items.map((item) => {
                              const Icon = Icons[item.icon] || null;

                              return (
                                <Link
                                  key={item._id}
                                  to={buildPath(item.slug)}
                                  className="flex items-start gap-4 group"
                                >
                                  <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#F5B301]">
                                    {Icon && <Icon size={18} />}
                                  </div>

                                  <div>
                                    <h4 className="text-[15px] font-semibold group-hover:text-[#F5B301] transition">
                                      {item.label}
                                    </h4>

                                    <p className="text-sm text-gray-500">
                                      View details
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* OTHER MENUS */
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