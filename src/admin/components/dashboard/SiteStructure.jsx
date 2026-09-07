import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api";

const SiteStructure = () => {
  const [navigation, setNavigation] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const [navRes, pagesRes] = await Promise.all([
          fetch(`${API_URL}/navigation`, { credentials: "include" }).catch(() => null),
          fetch(`${API_URL}/pages`, { credentials: "include" }).catch(() => null),
        ]);

        if (navRes && navRes.ok) {
          const navData = await navRes.json();
          setNavigation(Array.isArray(navData) ? navData : navData.menus || []);
        }

        if (pagesRes && pagesRes.ok) {
          const pagesData = await pagesRes.json();
          setPages(Array.isArray(pagesData) ? pagesData : pagesData.pages || []);
        }
      } catch (err) {
        console.error("Failed to load site structure:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, []);

  // Group pages by parentSlug
  const pagesByParent = pages.reduce((acc, page) => {
    const key = page.parentSlug || "root";
    if (!acc[key]) acc[key] = [];
    acc[key].push(page);
    return acc;
  }, {});

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-900
        bg-[#0d0d0d]
        text-white
        p-6
        min-h-[520px]
        flex
        flex-col
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="
            text-[11px]
            tracking-[0.18em]
            uppercase
            text-gray-400
            font-semibold
          "
        >
          Site Structure
        </span>

        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live tree ({pages.length} pages)
        </span>
      </div>

      <style>{`
        .site-structure-minimal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .site-structure-minimal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .site-structure-minimal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }
        .site-structure-minimal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45);
        }
        .site-structure-minimal-scroll::-webkit-scrollbar-button {
          display: none;
        }
        .site-structure-minimal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>

      {/* TREE with minimal scrollbar and bottom fade cue */}
      <div className="relative flex-1">
        <div className="site-structure-minimal-scroll font-mono text-xs leading-7 overflow-y-auto max-h-[460px] pr-2 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading site structure...
          </div>
        ) : navigation.length === 0 && pages.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No navigation items or pages configured.
          </div>
        ) : navigation.length > 0 ? (
          navigation.map((menu) => {
            const menuTitle = menu.title || menu.name || "Menu";
            const items = menu.items || menu.children || [];

            return (
              <div key={menu._id || menuTitle} className="border-b border-gray-800/80 pb-3 last:border-b-0">
                <div className="font-bold text-gray-200 flex items-center gap-2">
                  <span className="text-gray-500">📁</span>
                  <span>{menuTitle}</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    ({items.length} links)
                  </span>
                </div>

                {items.length > 0 && (
                  <div className="ml-5 border-l border-gray-800 pl-3.5 mt-1 space-y-1">
                    {items.slice(0, 8).map((sub, idx) => (
                      <div key={sub._id || idx} className="text-gray-400 hover:text-white transition-colors flex items-center justify-between">
                        <span>├─ {sub.label || sub.title || sub.name}</span>
                        {sub.url && (
                          <span className="text-[10px] text-gray-600 truncate max-w-[120px]">
                            {sub.url}
                          </span>
                        )}
                      </div>
                    ))}
                    {items.length > 8 && (
                      <div className="text-[10px] text-gray-600">
                        + {items.length - 8} more links
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          Object.entries(pagesByParent).map(([parent, parentPages]) => (
            <div key={parent} className="border-b border-gray-800/80 pb-3 last:border-b-0">
              <div className="font-bold text-gray-200 capitalize">
                📁 {parent === "root" ? "Main Website" : parent.replace("-", " ")}
              </div>
              <div className="ml-5 border-l border-gray-800 pl-3.5 mt-1 space-y-1">
                {parentPages.map((p) => (
                  <div key={p._id} className="text-gray-400">
                    ├─ {p.title} <span className="text-gray-600">/{p.slug}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        </div>

        {/* Subtle bottom fade cue */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0d0d0d] to-transparent opacity-90" />
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
        <Link to="/admin/navigation" className="text-gray-400 hover:text-white transition-colors">
          Manage Navigation →
        </Link>
        <Link to="/admin/pages" className="text-gray-400 hover:text-white transition-colors">
          View All Pages →
        </Link>
      </div>
    </div>
  );
};

export default SiteStructure;