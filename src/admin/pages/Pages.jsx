import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageActionsMenu from "../components/PageActionsMenu";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Landmark,
  FileText,
  Users,
  ClipboardEdit,
  Folder,
  User,
  Settings,
} from "lucide-react";

/**
 * Fonts: Fraunces (headings) + Plus Jakarta Sans (body) + IBM Plex Mono (paths/urls).
 * Add to index.html <head> if not already present:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

// Icon per group header — falls back to Folder for unrecognized group names
const getGroupIcon = (name) => {
  const key = name.toLowerCase();
  if (key.includes("student")) return GraduationCap;
  if (key.includes("infra")) return Landmark;
  if (key.includes("rti")) return FileText;
  if (key.includes("alumni")) return Users;
  if (key.includes("exam")) return ClipboardEdit;
  if (key.includes("staff")) return User;
  if (key.includes("admin")) return Settings;
  return Folder;
};

const Pages = () => {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/pages")
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDeletePage = async () => {
    if (!selectedPage) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `http://localhost:5000/api/pages/${selectedPage._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPages((prevPages) =>
        prevPages.filter(
          (page) => page._id !== selectedPage._id
        )
      );

      setShowDeleteModal(false);
      setSelectedPage(null);

      setToast({
        open: true,
        type: "success",
        message: "Page deleted successfully.",
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);

    } catch (error) {

      setToast({
        open: true,
        type: "error",
        message: error.message,
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);

    } finally {
      setIsDeleting(false);
    }
  };

const handleTogglePublish = async (page) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/pages/${page._id}/publish`,
      {
        method: "PATCH",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    // Update only the changed page
    setPages((prevPages) =>
      prevPages.map((p) =>
        p._id === page._id ? data.page : p
      )
    );

    // Success toast
    setToast({
      open: true,
      type: "success",
      message: data.message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);

  } catch (error) {
    setToast({
      open: true,
      type: "error",
      message: error.message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);
  }
};

  // GROUP PAGES BY PARENT
  const groupedPages = pages.reduce((acc, page) => {
    const key = page.parentSlug || "Uncategorized";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(page);

    return acc;
  }, {});

  const toggleCollapse = (group) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const toggleAll = () => {
    const groups = Object.keys(groupedPages);

    const allCollapsed = groups.every(
      (group) => collapsedGroups[group] === true
    );

    const newState = {};

    groups.forEach((group) => {
      newState[group] = !allCollapsed;
    });

    setCollapsedGroups(newState);
  };

  const allCollapsed =
    Object.keys(groupedPages).length > 0 &&
    Object.keys(groupedPages).every(
      (group) => collapsedGroups[group] === true
    );

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-32 text-neutral-400 text-sm tracking-wide"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <span className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-black animate-spin" />
          Loading pages…
        </span>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-200">
        <div>
          <h1
            className="text-[32px] text-black tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
          >
            Pages
          </h1>

          <p className="text-neutral-500 mt-1.5 text-[14.5px]">
            Manage website pages
          </p>
        </div>

        <Link
          to="/admin/pages/create"
          className="bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <span className="text-base leading-none">＋</span>
          Create Page
        </Link>
      </div>

      {/* COLLAPSE/EXPAND ALL BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-white bg-gray-900 hover:bg-black px-3 py-2 rounded-lg transition flex items-center gap-1.5"
        >
          {allCollapsed ? (
            <>
              <span>Expand All</span>
              <ChevronDown size={14} />
            </>
          ) : (
            <>
              <span>Collapse All</span>
              <ChevronUp size={14} />
            </>
          )}
        </button>
      </div>

      {/* GROUPS */}
      <div className="space-y-5">
        {Object.entries(groupedPages).map(
          ([parent, items]) => {
            const GroupIcon = getGroupIcon(parent);

            return (
              <div
                key={parent}
                className="bg-white border border-neutral-200 rounded-2xl overflow-visible shadow-sm"
              >
                {/* PARENT HEADER */}
                <div
                  onClick={() => toggleCollapse(parent)}
                  className="px-5 py-4 flex items-center justify-between cursor-pointer select-none rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                      <GroupIcon size={17} strokeWidth={2} />
                    </span>
                    <span className="w-px h-5 bg-neutral-200" />
                    <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-800">
                      {parent.replace("-", " ")}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">
                      {items.length} {items.length === 1 ? "page" : "pages"}
                    </span>
                    {collapsedGroups[parent] ? (
                      <ChevronDown size={16} className="text-neutral-400" />
                    ) : (
                      <ChevronUp size={16} className="text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* CHILD PAGES */}
                {!collapsedGroups[parent] && (
                  <div className="border-t border-neutral-100">
                    {items.map((page) => (
                      <div
                        key={page._id}
                        className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-black text-[15px]">
                            {page.title}
                          </h3>

                          <p
                            className="text-[12.5px] text-neutral-400 mt-0.5"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            /{page.parentSlug
                              ? `${page.parentSlug}/`
                              : ""}
                            {page.slug}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition
    ${page.isPublished
                                ? "border-black bg-black text-white"
                                : "border-neutral-300 bg-white text-neutral-600"
                              }`}
                          >
                            <span
                              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                page.isPublished
                                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                  : "bg-neutral-400"
                              }`}
                            />

                            {page.isPublished ? "Published" : "Draft"}
                          </span>

                          <PageActionsMenu
                            isPublished={page.isPublished}
                            onEdit={() => navigate(`/admin/pages/${page._id}`)}
                            onDuplicate={() => console.log("Duplicate", page)}
                            onTogglePublish={() => handleTogglePublish(page)}
                            onDelete={() => {
                              setSelectedPage(page);
                              setShowDeleteModal(true);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <ConfirmModal
        open={showDeleteModal}
        loading={isDeleting}
        title="Delete Page"
        message={`Are you sure you want to delete "${selectedPage?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          if (isDeleting) return;

          setShowDeleteModal(false);
          setSelectedPage(null);
        }}
        onConfirm={handleDeletePage}
      />

    </div>
  );
};

export default Pages;