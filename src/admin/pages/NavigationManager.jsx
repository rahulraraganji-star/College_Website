import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Folder,
  GraduationCap,
  Landmark,
  FileText,
  Users,
  ClipboardEdit,
  User,
  Settings,
  Home,
  Info,
  Newspaper,
  Phone,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Image,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import NavigationActionsMenu from "../components/NavigationActionsMenu";
import EditNavigationChildModal from "../components/EditNavigationChildModal";

// Icon per menu — picked from the menu title, falls back to Folder
const getMenuIcon = (title = "") => {
  const key = title.toLowerCase();
  if (key.includes("home")) return Home;
  if (key.includes("about")) return Info;
  if (key.includes("student")) return GraduationCap;
  if (key.includes("infra")) return Landmark;
  if (key.includes("rti")) return FileText;
  if (key.includes("alumni")) return Users;
  if (key.includes("exam")) return ClipboardEdit;
  if (key.includes("staff") || key.includes("faculty")) return User;
  if (key.includes("admin")) return Settings;
  if (key.includes("news") || key.includes("event")) return Newspaper;
  if (key.includes("contact")) return Phone;
  if (key.includes("academic") || key.includes("course")) return BookOpen;
  if (key.includes("career") || key.includes("placement")) return Briefcase;
  if (key.includes("department")) return Building2;
  if (key.includes("calendar")) return Calendar;
  if (key.includes("gallery") || key.includes("media")) return Image;
  return Folder;
};

/**
 * Fonts: Fraunces (headings) + Plus Jakarta Sans (body) + IBM Plex Mono (paths/urls).
 * Add to index.html <head> if not already present:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

const NavigationManager = () => {
  const [editingChild, setEditingChild] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedMenus, setCollapsedMenus] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form, setForm] = useState({
    title: "",
    showInNavbar: true,
  });
  const [titleError, setTitleError] = useState("");
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  // FIXED: Added credentials and proper error handling
  const loadNavigation = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/navigation/admin",
        {
          credentials: "include", // ADDED
        }
      );

      const data = await res.json();

      // FIXED: Proper error handling
      if (!res.ok) {
        throw new Error(data.message || "Failed to load navigation");
      }

      console.log(data);
      setNavigation(data);

    } catch (err) {
      console.error(err);
      // FIXED: Set navigation to empty array on error
      setNavigation([]);
      setToast({
        open: true,
        type: "error",
        message: err.message || "Failed to load navigation",
      });
      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Added credentials
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetch(
        `http://localhost:5000/api/navigation/child/${deleteTarget._id}`,
        {
          method: "DELETE",
          credentials: "include", // ADDED
        }
      );

      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadNavigation();
    } catch (err) {
      console.error(err);
    }
  };

  // FIXED: Added credentials
  const deleteMenu = async () => {
    if (!selectedMenu) return;

    try {
      setIsDeletingMenu(true);

      const res = await fetch(
        `http://localhost:5000/api/navigation/menu/${selectedMenu._id}`,
        {
          method: "DELETE",
          credentials: "include", // ADDED
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setToast({
          open: true,
          type: "error",
          message: data.message,
        });

        setTimeout(() => {
          setToast((prev) => ({
            ...prev,
            open: false,
          }));
        }, 3000);

        return;
      }

      setShowDeleteMenuModal(false);
      setSelectedMenu(null);

      setToast({
        open: true,
        type: "success",
        message: "Navigation menu deleted successfully.",
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);

      loadNavigation();

    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingMenu(false);
    }
  };

  // FIXED: Added credentials
  const reorderMenu = async (id, direction) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/navigation/menu/${id}/reorder`,
        {
          method: "PATCH",
          credentials: "include", // ADDED
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ direction }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      loadNavigation();

    } catch (err) {
      console.error(err);
    }
  };

  // FIXED: Added credentials
  const reorderChild = async (id, direction) => {
    try {
      await fetch(
        `http://localhost:5000/api/navigation/child/${id}/reorder`,
        {
          method: "PATCH",
          credentials: "include", // ADDED
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ direction }),
        }
      );

      loadNavigation();
    } catch (err) {
      console.error(err);
    }
  };

  // REMOVED: toggleChildVisibility function - no longer needed

  const editChild = (child) => {
    setEditingChild(child);
    setShowEditModal(true);
  };

  // FIXED: Added credentials
  const saveChild = async (form) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/navigation/child/${editingChild._id}`,
        {
          method: "PATCH",
          credentials: "include", // ADDED
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setShowEditModal(false);
      setEditingChild(null);

      await loadNavigation();

      setToast({
        open: true,
        type: "success",
        message: "Child page updated successfully.",
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);

    } catch (err) {
      console.error(err);

      setToast({
        open: true,
        type: "error",
        message: err.message || "Failed to update child page.",
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);
    }
  };

  // FIXED: Added credentials
  const saveMenu = async () => {
    if (!form.title.trim()) {
      setTitleError("Please enter a menu name");
      return;
    }

    setTitleError("");

    try {
      const url = editingMenu
        ? `http://localhost:5000/api/navigation/menu/${editingMenu._id}`
        : "http://localhost:5000/api/navigation/menu";

      const method = editingMenu ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include", // ADDED
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({
          open: true,
          type: "error",
          message: data.message,
        });

        setTimeout(() => {
          setToast((prev) => ({
            ...prev,
            open: false,
          }));
        }, 3000);

        return;
      }

      setShowCreateModal(false);
      setEditingMenu(null);
      setForm({
        title: "",
        showInNavbar: true,
      });

      setToast({
        open: true,
        type: "success",
        message: editingMenu
          ? "Navigation menu updated successfully."
          : "Navigation menu created successfully.",
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          open: false,
        }));
      }, 3000);

      loadNavigation();

    } catch (err) {
      console.error(err);
    }
  };

  const editMenu = (menu) => {
    setEditingMenu(menu);
    setForm({
      title: menu.title,
      showInNavbar: menu.showInNavbar,
    });
    setShowCreateModal(true);
  };

  const toggleCollapse = (menuKey) => {
    setCollapsedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const toggleAll = () => {
    const allCollapsed =
      navigation.length > 0 &&
      navigation.every((menu) => collapsedMenus[menu.key]);

    const next = {};

    navigation.forEach((menu) => {
      next[menu.key] = !allCollapsed;
    });

    setCollapsedMenus(next);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      title: value,
    });
    if (value.trim()) {
      setTitleError("");
    }
  };

  const generatedKey = form.title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const generatedSlug = `/${generatedKey}`;

  useEffect(() => {
    loadNavigation();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-32 text-neutral-400 text-sm tracking-wide"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <span className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-black animate-spin" />
          Loading navigation…
        </span>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-200">
          <div>
            <h1
              className="text-[32px] text-black tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
            >
              Navigation
            </h1>

            <p className="text-neutral-500 mt-1.5 text-[14.5px]">
              Manage navbar menus and their pages
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span className="text-base leading-none">＋</span>
            Add Menu
          </button>
        </div>

        {/* COLLAPSE/EXPAND ALL BUTTON */}
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-white bg-gray-900 hover:bg-black px-3 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            {navigation.length > 0 && navigation.every((m) => collapsedMenus[m.key]) ? (
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

        {/* MENUS */}
        <div className="space-y-5">
          {navigation.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm">No navigation menus found.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-sm font-medium text-black hover:underline underline-offset-2"
              >
                Create your first menu
              </button>
            </div>
          ) : (
            navigation.map((menu, menuIndex) => {
              const isFirst = menuIndex === 0;
              const isLast = menuIndex === navigation.length - 1;
              const isCollapsed = collapsedMenus[menu.key];
              const MenuIcon = getMenuIcon(menu.title);

              return (
                <div
                  key={menu._id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-visible shadow-sm"
                >
                  {/* MENU HEADER */}
                  <div className="px-5 py-4 flex items-center justify-between select-none rounded-2xl">
                    <div
                      onClick={() => toggleCollapse(menu.key)}
                      className="flex items-center gap-4 cursor-pointer min-w-0"
                    >
                      <span className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                        <MenuIcon size={17} strokeWidth={2} />
                      </span>
                      <span className="w-px h-5 bg-neutral-200 shrink-0" />
                      <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-800 truncate">
                        {menu.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">
                        {menu.children?.length || 0}{" "}
                        {menu.children?.length === 1 ? "page" : "pages"}
                      </span>

                      <button
                        type="button"
                        onClick={() => reorderMenu(menu._id, "up")}
                        disabled={isFirst}
                        title="Move up"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      >
                        <ArrowUp size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => reorderMenu(menu._id, "down")}
                        disabled={isLast}
                        title="Move down"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      >
                        <ArrowDown size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => editMenu(menu)}
                        title="Edit menu"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMenu(menu);
                          setShowDeleteMenuModal(true);
                        }}
                        title="Delete menu"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>

                      <span className="w-px h-5 bg-neutral-200" />

                      <button
                        type="button"
                        onClick={() => toggleCollapse(menu.key)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
                      >
                        {isCollapsed ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronUp size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CHILD PAGES */}
                  {!isCollapsed && (
                    <div className="border-t border-neutral-100">
                      {menu.children?.length ? (
                        menu.children.map((child, index) => (
                          <div
                            key={child._id}
                            className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                          >
                            <div className="min-w-0">
                              <h3 className="font-semibold text-black text-[15px]">
                                {child.label}
                              </h3>

                              <p
                                className="text-[12.5px] text-neutral-400 mt-0.5"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                              >
                                {child.slug}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => reorderChild(child._id, "up")}
                                disabled={index === 0}
                                title="Move up"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                              >
                                <ArrowUp size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => reorderChild(child._id, "down")}
                                disabled={index === menu.children.length - 1}
                                title="Move down"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                              >
                                <ArrowDown size={14} />
                              </button>

                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition ${
                                  child.isActive
                                    ? "border-black bg-black text-white"
                                    : "border-neutral-300 bg-white text-neutral-600"
                                }`}
                              >
                                <span
                                  className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                    child.isActive
                                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                      : "bg-neutral-400"
                                  }`}
                                />
                                {child.isActive ? "Published" : "Draft"}
                              </span>

                              <NavigationActionsMenu
                                isVisible={child.isActive}
                                onEdit={() => editChild(child)}
                                // REMOVED: onToggleVisibility prop
                                onDelete={() => {
                                  setDeleteTarget(child);
                                  setShowDeleteModal(true);
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(child);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete page"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-neutral-400 text-sm py-4 px-6">
                          No child pages
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl p-7 w-[450px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <h2
                className="text-xl text-black tracking-tight mb-6"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
              >
                {editingMenu
                  ? "Edit Navigation Menu"
                  : "Add Navigation Menu"}
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    placeholder="Menu Title"
                    value={form.title}
                    onChange={handleTitleChange}
                    className={`w-full border rounded-xl px-4 py-3 text-[14.5px] outline-none focus:ring-2 focus:ring-black/10 transition ${
                      titleError ? "border-red-500" : "border-neutral-300"
                    }`}
                  />
                  {titleError && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {titleError}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                    Generated Information
                  </h3>

                  <div>
                    <p className="text-[11px] text-neutral-400">Key</p>
                    <p
                      className="text-sm text-neutral-800"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {editingMenu ? editingMenu.key : generatedKey}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-neutral-400">URL</p>
                    <p
                      className="text-sm text-neutral-800"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {editingMenu ? editingMenu.slug : generatedSlug}
                    </p>
                  </div>

                  {editingMenu && (
                    <div>
                      <p className="text-[11px] text-neutral-400">
                        Child Pages
                      </p>
                      <p className="text-sm font-medium text-neutral-800">
                        {navigation.find(
                          (m) => m._id === editingMenu._id
                        )?.children?.length || 0} Pages
                      </p>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3 text-[14.5px] text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.showInNavbar}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        showInNavbar: e.target.checked,
                      })
                    }
                    className="accent-black w-4 h-4"
                  />
                  Show in Navbar
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingMenu(null);
                    setTitleError("");
                    setForm({
                      title: "",
                      showInNavbar: true,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={saveMenu}
                  className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  {editingMenu ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          open={showDeleteMenuModal}
          loading={isDeletingMenu}
          title="Delete Navigation Menu"
          message={`Delete "${selectedMenu?.title}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => {
            if (isDeletingMenu) return;
            setShowDeleteMenuModal(false);
            setSelectedMenu(null);
          }}
          onConfirm={deleteMenu}
        />

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/95 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-xl animate-in zoom-in-95 slide-in-from-bottom-3 duration-300">

              <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />

              <div className="relative px-8 pt-8">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                  <svg
                    className="relative h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                </div>

                <h2
                  className="mt-5 text-xl tracking-tight text-neutral-900"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
                >
                  Delete this page?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  This will permanently remove the page and everything tied to it.
                  <span className="font-medium text-neutral-700"> This action cannot be undone.</span>
                </p>
              </div>

              <div className="relative mx-8 mt-6 rounded-2xl border border-neutral-100 bg-gradient-to-b from-neutral-50 to-neutral-50/40 p-4">
                <ul className="space-y-2.5 text-sm text-neutral-700">
                  {[
                    "The page content",
                    "All sections inside the page",
                    "The navigation link",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-7 flex justify-end gap-3 border-t border-neutral-100 px-8 py-5">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition"
                >
                  Delete Page
                </button>
              </div>
            </div>
          </div>
        )}

        <Toast
          open={toast.open}
          type={toast.type}
          message={toast.message}
        />
      </div>

      <EditNavigationChildModal
        open={showEditModal}
        child={editingChild}
        onClose={() => {
          setShowEditModal(false);
          setEditingChild(null);
        }}
        onSave={saveChild}
      />
    </>
  );
};

export default NavigationManager;