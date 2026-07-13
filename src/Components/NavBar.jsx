import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

const Navbar = () => {

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRefs = useRef({});

  // FETCH NAVIGATION + PAGES
  useEffect(() => {

    const fetchNavbarData = () => {

      Promise.all([
        fetch("http://localhost:5000/api/navigation")
          .then((res) => res.json()),

        fetch("http://localhost:5000/api/pages")
          .then((res) => res.json()),
      ])

        .then(([navData, pagesData]) => {

          const safeMenus = Array.isArray(navData)
            ? navData
            : [];

          const safePages = Array.isArray(pagesData)
            ? pagesData
            : [];

          // MERGE DYNAMIC PAGES
          const updatedMenus = safeMenus.map((menu) => {

            const parentKey =
              (
                menu.key ||
                menu.slug ||
                ""
              )
                .replace(/^\/+/, "")
                .toLowerCase();

            // MATCH PAGES
            const relatedPages = safePages.filter(
              (page) =>
                page.parentSlug?.toLowerCase() ===
                parentKey
            );

            // CONVERT TO NAV ITEMS
            const dynamicItems = relatedPages.map(
              (page) => ({
                _id: page._id,
                label: page.title,

                // IMPORTANT FIX
                slug: `/${parentKey}/${page.slug}`,

                icon: "ChevronRight",
              })
            );

            // MERGE + DEDUPE
            const mergedItems = [
              ...(menu.items || []),
              ...dynamicItems,
            ];

            const seen = new Set();

            const uniqueItems = mergedItems.filter(
              (item) => {

                // NORMALIZE SLUG SO FORMAT DIFFERENCES
                // (leading slash, casing) DON'T SLIP
                // PAST THE DEDUPE CHECK
                const normalizedSlug = (item.slug || "")
                  .replace(/^\/+/, "")
                  .toLowerCase();

                const key =
                  normalizedSlug ||
                  (item.label || "").toLowerCase();

                if (seen.has(key)) return false;

                seen.add(key);

                return true;

              }
            );

            return {
              ...menu,

              items: uniqueItems,
            };
          });

          setMenus(updatedMenus);

          setLoading(false);

        })

        .catch((err) => {

          console.error("NAV FETCH ERROR:", err);

          setMenus([]);

          setLoading(false);

        });

    };

    // INITIAL FETCH
    fetchNavbarData();

    // LISTEN FOR CREATE/UPDATE EVENTS
    window.addEventListener(
      "navbarRefresh",
      fetchNavbarData
    );

    // CLEANUP
    return () => {

      window.removeEventListener(
        "navbarRefresh",
        fetchNavbarData
      );

    };

  }, []);

  // SCROLL EFFECT
  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  // LOADING
  if (loading) {
    return <nav className="h-[90px]" />;
  }

  // BUILD PATH
  const buildPath = (slug) => {

    if (!slug) return "/";

    return `/${slug.replace(/^\/+/, "")}`;

  };

  // DROPDOWN POSITIONING
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
    <nav className="sticky top-0 z-50 bg-[#F8F6F1] border-b border-[#E8E2D3]">

      <div className="h-[2px] bg-[#C89B2F]" />

      <div
        className={`
          ${scrolled ? "h-[64px]" : "h-[78px]"}
          transition-all duration-300
          flex items-center
        `}
      >

        <div className="max-w-[1300px] mx-auto w-full px-6">

         <ul className="flex items-center justify-center gap-10 whitespace-nowrap">

            {menus.map((menu, index) => {

              const isAbout =
                menu.title === "About Us";

              const hasChildren =
                menu.items &&
                menu.items.length > 0;

              return (
                <li
                  key={menu._id || index}
                  className="relative group"
                  onMouseEnter={
                    hasChildren
                      ? () =>
                          positionDropdown(
                            index,
                            isAbout
                          )
                      : undefined
                  }
                >

                  {/* TOP ITEM */}
                  {hasChildren ? (

                    <span className="relative px-3 py-2 text-[18px] font-medium font-['Inter'] text-gray-800 cursor-pointer">

                      {menu.title}

                      <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#C89B2F] transition-all duration-300 group-hover:w-full" />

                    </span>

                  ) : (

                    <Link
                      to={buildPath(
                        menu.slug || menu.key
                      )}
                      className="relative px-3 py-2 text-[16px] font-medium font-['Inter'] text-gray-800"
                    >

                      {menu.title}

                      <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#C89B2F] transition-all duration-300 hover:w-full" />

                    </Link>

                  )}

                  {/* DROPDOWN */}
                  {hasChildren && (

                    <div
                      ref={(el) =>
                        (dropdownRefs.current[index] =
                          el)
                      }
                      className="
                        absolute top-full z-50
                        opacity-0 translate-y-3
                        pointer-events-none
                        group-hover:opacity-100
                        group-hover:translate-y-0
                        group-hover:pointer-events-auto
                        transition-all duration-300
                      "
                    >

                      <div className="mt-4 bg-white border border-[#E5E5E5] shadow-[0_25px_60px_rgba(0,0,0,0.12)] rounded-xl p-6 w-[820px] max-w-[90vw]">

                        {isAbout ? (

                          <div className="flex gap-10 items-start">

                            <Link
                              to="/about/history"
                              className="w-[190px] border border-[#C89B2F] rounded-xl p-6 bg-[#FFF8E6] flex flex-col justify-between min-h-[220px]"
                            >

                              <div>

                                <h3 className="text-[15px] font-semibold mb-6">
                                  About Our Institution
                                </h3>

                                <p className="text-sm text-gray-600">
                                  Learn about our legacy and values.
                                </p>

                              </div>

                              <span className="text-sm font-semibold text-[#C89B2F] mt-8">
                                Explore →
                              </span>

                            </Link>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-8">

                              {menu.items.map((item) => {

                                const Icon =
                                  Icons[item.icon] || null;

                                return (
                                  <Link
                                    key={item._id}
                                    to={buildPath(item.slug)}
                                    className="flex items-start gap-4 group"
                                  >

                                    <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#C89B2F]">

                                      {Icon && (
                                        <Icon size={18} />
                                      )}

                                    </div>

                                    <div>

                                      <h4 className="text-[15px] font-medium group-hover:text-[#C89B2F]">
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

                          <div className="grid grid-cols-3 gap-6">

                            {menu.items.map((item) => {

                              const Icon =
                                Icons[item.icon] || null;

                              return (
                                <Link
                                  key={item._id}
                                  to={buildPath(item.slug)}
                                  className="flex gap-3"
                                >

                                  <div className="w-8 h-8 bg-[#FFF4D6] rounded-full flex items-center justify-center text-[#C89B2F]">

                                    {Icon && (
                                      <Icon size={16} />
                                    )}

                                  </div>

                                  <div>

                                    <h4 className="text-sm font-medium">
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

      </div>

    </nav>
  );
};

export default Navbar;