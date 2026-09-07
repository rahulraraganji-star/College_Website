import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Menu, X, ChevronDown } from "lucide-react";
import { prefetchPage } from "../Pages/DynamicPage";
import { prefetchSidebar } from "../Layouts/SectionLayout";

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

      fetch("/api/navigation")
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

  // RECOMPUTE DROPDOWN POSITION ON RESIZE
  useEffect(() => {
    const handleResize = () => {
      menus.forEach((_, index) => positionDropdown(index));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menus]);

  // LOADING
  if (loading) {
    return <nav className="h-[90px]" />;
  }

  // BUILD PATH
  const buildPath = (slug) => {

    if (!slug) return "/";

    return `/${slug.replace(/^\/+/, "")}`;

  };

  // DROPDOWN POSITIONING - instant coordinates without animating left/right
  const positionDropdown = (index) => {
    const el = dropdownRefs.current[index];
    if (!el) return;

    const vw = window.innerWidth;
    const parentLi = el.closest("li");
    if (!parentLi) return;

    const parentRect = parentLi.getBoundingClientRect();
    const dropdownContent = el.querySelector(".dropdown-card");
    const contentWidth = dropdownContent?.offsetWidth || 760;

    // Reset styles
    el.style.position = "absolute";
    el.style.top = "100%";

    // Center under the parent item
    const centerOffset = (parentRect.width - contentWidth) / 2;
    let leftPos = centerOffset;

    // Viewport clamping (keep dropdown completely within visible viewport with safe 16px margins)
    if (parentRect.left + leftPos < 16) {
      leftPos = 16 - parentRect.left;
    } else if (parentRect.left + leftPos + contentWidth > vw - 16) {
      leftPos = vw - 16 - parentRect.left - contentWidth;
    }

    el.style.left = `${leftPos}px`;
    el.style.right = "auto";
  };

  const handlePrefetchMenu = (menu) => {
    if (!menu) return;
    if (menu.key) {
      prefetchSidebar(menu.key);
    }
    if (Array.isArray(menu.items)) {
      menu.items.forEach((item) => {
        if (item.slug) {
          const parts = item.slug.split("/").filter(Boolean);
          const itemSlug = parts.pop();
          if (itemSlug) prefetchPage(itemSlug);
        }
      });
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
          transition-[height] duration-300 ease-out
          flex items-center
        `}
      >

        <div className="max-w-[1300px] mx-auto w-full px-6 flex items-center justify-between lg:justify-center relative">

          {/* DESKTOP NAV */}
          <ul className="hidden lg:flex items-center justify-center gap-10 whitespace-nowrap">

            {menus.map((menu, index) => {

              const hasChildren =
                menu.items &&
                menu.items.length > 0;

              return (
                <li
                  key={menu._id || index}
                  className="relative group py-4"
                  onMouseEnter={() => {
                    positionDropdown(index);
                    handlePrefetchMenu(menu);
                  }}
                >

                  {/* TOP ITEM */}
                  {hasChildren ? (

                    <span className="relative px-2 py-1 text-[17px] font-medium font-['Inter'] text-gray-800 cursor-pointer inline-block transition-colors duration-150 group-hover:text-black">

                      {menu.title}

                      <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#C89B2F] transition-[width] duration-200 ease-out group-hover:w-full" />

                    </span>

                  ) : (

                    <Link
                      to={buildPath(
                        menu.slug || menu.key
                      )}
                      onMouseEnter={() => {
                        const parts = (menu.slug || menu.key || "").split("/").filter(Boolean);
                        const itemSlug = parts.pop();
                        if (itemSlug) prefetchPage(itemSlug);
                      }}
                      className="relative px-2 py-1 text-[17px] font-medium font-['Inter'] text-gray-800 transition-colors duration-150 hover:text-black"
                    >

                      {menu.title}

                      <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#C89B2F] transition-[width] duration-200 ease-out hover:w-full" />

                    </Link>

                  )}

                  {/* DROPDOWN - POSITIONED BY JS */}
                  {hasChildren && (
                    <div
                      ref={(el) => (dropdownRefs.current[index] = el)}
                      className="
                        absolute top-full z-50 pt-2
                        opacity-0 pointer-events-none translate-y-1.5
                        group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0
                        transition-all duration-150 ease-out transform-gpu
                      "
                    >
                      <div className="dropdown-card bg-white border border-[#E5E5E5] shadow-[0_15px_35px_rgba(0,0,0,0.08)] rounded-2xl p-5 w-[760px] max-w-[calc(100vw-32px)] whitespace-normal">

                        <div className="grid grid-cols-3 gap-2.5">

                          {menu.items.map((item) => {

                            const Icon =
                              Icons[item.icon] || null;

                            const itemSlug = item.slug ? item.slug.split("/").filter(Boolean).pop() : null;

                            return (
                              <Link
                                key={item._id}
                                to={buildPath(item.slug)}
                                onMouseEnter={() => {
                                  if (itemSlug) prefetchPage(itemSlug);
                                }}
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-colors duration-150 hover:bg-[#F8F6F1]/60 min-w-0"
                              >

                                <div className="w-8 h-8 bg-[#FFF4D6] rounded-lg flex items-center justify-center text-[#C89B2F] shrink-0 transition-colors">

                                  {Icon && (
                                    <Icon size={16} />
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <h4 className="text-[13.5px] font-semibold text-gray-800 transition-colors duration-150 hover:text-[#C89B2F] leading-snug break-words whitespace-normal">
                                    {item.label}
                                  </h4>

                                  <p className="text-[11.5px] text-gray-400 whitespace-normal">
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

                                  <div className="min-w-0 flex-1">

                                    <h4 className="text-[14px] font-medium text-gray-800 leading-snug break-words">
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