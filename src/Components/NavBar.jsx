import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // MOBILE STATE (new — does not affect desktop logic)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileIndex, setOpenMobileIndex] = useState(null);

  const dropdownRefs = useRef({});

  // FETCH NAVIGATION ONLY
  useEffect(() => {

    const fetchNavbarData = () => {

      fetch("http://localhost:5000/api/navigation")
        .then((res) => res.json())
        .then((navData) => {

          const safeMenus = Array.isArray(navData)
            ? navData
            : [];

          // Convert children to items for the UI
          const updatedMenus = safeMenus.map((menu) => {
            return {
              ...menu,
              items: menu.children || [],
            };
          });

          setMenus(updatedMenus);
          console.log(updatedMenus);

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

  // LOCK BODY SCROLL WHEN MOBILE MENU OPEN (new — mobile only)
  useEffect(() => {

    document.body.style.overflow = mobileOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };

  }, [mobileOpen]);

  // CLOSE MOBILE MENU IF VIEWPORT GROWS PAST BREAKPOINT (new)
  useEffect(() => {

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setOpenMobileIndex(null);
      }
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);

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

  // TOGGLE MOBILE ACCORDION (new)
  const toggleMobileSubmenu = (index) => {
    setOpenMobileIndex((prev) => (prev === index ? null : index));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileIndex(null);
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

        <div className="max-w-[1300px] mx-auto w-full px-6 flex items-center justify-between lg:justify-center">

          {/* DESKTOP NAV — unchanged, just hidden below lg */}
          <ul className="hidden lg:flex items-center justify-center gap-10 whitespace-nowrap">

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
                      className="relative px-3 py-2 text-[18px] font-medium font-['Inter'] text-gray-800"
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

          {/* MOBILE BAR — hamburger only, visible below lg */}
          <div className="flex lg:hidden items-center justify-between w-full">

            <span className="text-[17px] font-semibold font-['Inter'] text-gray-800">
              Menu
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2 -mr-2 text-gray-800"
            >
              <Menu size={26} />
            </button>

          </div>

        </div>

      </div>

      {/* MOBILE OFF-CANVAS PANEL */}
      <div
        className={`
          fixed inset-0 z-[60] lg:hidden
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >

        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={closeMobileMenu}
        />

        {/* SLIDE-IN DRAWER */}
        <div
          className={`
            absolute top-0 right-0 h-full w-[85%] max-w-[360px]
            bg-[#F8F6F1] shadow-[0_0_40px_rgba(0,0,0,0.2)]
            flex flex-col
            transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >

          <div className="h-[2px] bg-[#C89B2F]" />

          <div className="flex items-center justify-between px-6 h-[64px] border-b border-[#E8E2D3]">

            <span className="text-[17px] font-semibold font-['Inter'] text-gray-800">
              Menu
            </span>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="p-2 -mr-2 text-gray-800"
            >
              <X size={24} />
            </button>

          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4">

            <ul className="flex flex-col">

              {menus.map((menu, index) => {

                const isAbout =
                  menu.title === "About Us";

                const hasChildren =
                  menu.items &&
                  menu.items.length > 0;

                const isOpen = openMobileIndex === index;

                return (
                  <li
                    key={menu._id || index}
                    className="border-b border-[#E8E2D3] last:border-b-0"
                  >

                    {hasChildren ? (

                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(index)}
                        className="w-full flex items-center justify-between px-4 py-4 text-[16px] font-medium font-['Inter'] text-gray-800"
                      >

                        {menu.title}

                        <ChevronDown
                          size={18}
                          className={`
                            text-[#C89B2F] transition-transform duration-300
                            ${isOpen ? "rotate-180" : "rotate-0"}
                          `}
                        />

                      </button>

                    ) : (

                      <Link
                        to={buildPath(menu.slug || menu.key)}
                        onClick={closeMobileMenu}
                        className="block px-4 py-4 text-[16px] font-medium font-['Inter'] text-gray-800"
                      >

                        {menu.title}

                      </Link>

                    )}

                    {/* MOBILE SUBMENU */}
                    {hasChildren && (

                      <div
                        className={`
                          overflow-hidden transition-all duration-300
                          ${isOpen ? "max-h-[1200px]" : "max-h-0"}
                        `}
                      >

                        <div className="pb-4 pl-4 pr-2">

                          {isAbout && (

                            <Link
                              to="/about/history"
                              onClick={closeMobileMenu}
                              className="block border border-[#C89B2F] rounded-xl p-4 bg-[#FFF8E6] mb-4"
                            >

                              <h3 className="text-[14px] font-semibold mb-1">
                                About Our Institution
                              </h3>

                              <p className="text-xs text-gray-600">
                                Learn about our legacy and values.
                              </p>

                              <span className="text-xs font-semibold text-[#C89B2F] mt-2 inline-block">
                                Explore →
                              </span>

                            </Link>

                          )}

                          <div className="flex flex-col gap-1">

                            {menu.items.map((item) => {

                              const Icon =
                                Icons[item.icon] || null;

                              return (
                                <Link
                                  key={item._id}
                                  to={buildPath(item.slug)}
                                  onClick={closeMobileMenu}
                                  className="flex items-center gap-3 py-2"
                                >

                                  <div className="w-8 h-8 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#C89B2F] shrink-0">

                                    {Icon && (
                                      <Icon size={16} />
                                    )}

                                  </div>

                                  <div>

                                    <h4 className="text-[14px] font-medium text-gray-800">
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

                      </div>

                    )}

                  </li>
                );
              })}

            </ul>

          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;