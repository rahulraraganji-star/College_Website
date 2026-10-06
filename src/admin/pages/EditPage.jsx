import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicPageEditor from "../components/DynamicPageEditor";
import CoursesEditor from "../editors/CoursesEditor";
import AddSectionModal from "../components/AddSectionModal";
import Toast from "../components/Toast";
import { createSection } from "../utils/sectionFactory";

const TITLE_MAX = 80;

// RELATIVE TIME HELPER
const timeAgo = (dateString) => {
  if (!dateString) return "Never";

  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

// LOADING SKELETON
const EditPageSkeleton = () => (
  <div className="max-w-[1400px] mx-auto animate-pulse">
    <div className="mb-8 pb-6 border-b border-gray-200">
      <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
      <div className="h-7 w-48 bg-gray-200 rounded" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="space-y-6 min-w-0">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
          <div>
            <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-100 rounded-lg" />
          <div className="h-24 w-full bg-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // SNAPSHOT OF LAST SAVED STATE (FOR DIRTY CHECK)
  const savedSnapshotRef = useRef(null);

  const isDirty =
    page && savedSnapshotRef.current
      ? JSON.stringify(page) !== savedSnapshotRef.current
      : false;

  // FETCH PAGE & MENUS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, menusRes] = await Promise.all([
          fetch(`/api/pages/id/${id}`, {
            credentials: "include",
          }),
          fetch(`/api/navigation/admin`, {
            credentials: "include",
          }).catch(() => null),
        ]);

        if (!pageRes.ok) {
          throw new Error("Failed to fetch page");
        }

        const data = await pageRes.json();
        setPage(data);
        savedSnapshotRef.current = JSON.stringify(data);

        if (menusRes && menusRes.ok) {
          const menuData = await menusRes.json();
          setMenus(Array.isArray(menuData) ? menuData : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // WARN BEFORE LEAVING WITH UNSAVED CHANGES
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPage((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleAddSection = (type) => {
    const newSection = createSection(type);

    if (!newSection) return;

    setPage((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));

    setShowSectionModal(false);
  };

  // UPDATE PAGE
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    setSaveStatus("saving");

    try {
      const response = await fetch(
        `/api/pages/${id}`,
        {
          method: "PUT",
          credentials: "include", // ✅ Send cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(page),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update page");
      }

      if (data?.approvalRequired) {
        setSaveStatus("saved");
        showToast("info", data.message || "Your changes have been submitted for Admin approval.");
        savedSnapshotRef.current = JSON.stringify(page);
        setTimeout(() => setSaveStatus("idle"), 2500);
        return;
      }

      // Handle both direct page object and { page: updatedPage } envelope
      const updatedPage = data?.page || data;

      if (updatedPage && typeof updatedPage === "object") {
        setPage(updatedPage);
        savedSnapshotRef.current = JSON.stringify(updatedPage);
      } else {
        savedSnapshotRef.current = JSON.stringify(page);
      }

      setSaveStatus("saved");
      showToast("success", "Changes saved successfully!");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (error) {
      console.error("Save Page Error:", error);
      setSaveStatus("idle");
      showToast("error", error.message || "Failed to update page");
    }
  };

  // DELETE PAGE
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const targetId = page?._id || id;
      const response = await fetch(
        `/api/pages/${targetId}`,
        {
          method: "DELETE",
          credentials: "include", // ✅ FIXED: Send cookie
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete page");
      }

      navigate("/admin/pages");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete page");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <EditPageSkeleton />;
  }

  if (!page) {
    return (
      <div className="max-w-[1400px] mx-auto py-16 text-center text-sm text-gray-500">
        Page not found.
      </div>
    );
  }

  // ==========================================
  // SPECIALIZED COURSES EDITOR
  // ==========================================
  if (page.template === "courses") {
    return (
      <>
        <div className="max-w-[1400px] mx-auto">
          <CoursesEditor
            page={page}
            setPage={setPage}
            onSave={handleSubmit}
            saveStatus={saveStatus}
            menus={menus}
          />
        </div>
        <Toast
          open={toast.open}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
      </>
    );
  }

  const sectionCount = page.sections?.length || 0;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
            Pages
          </p>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight">
            Edit Page
          </h1>

          {/* PAGE METADATA */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5 text-[14px] text-neutral-500">
            <span>
              /{page.slug || "—"}
            </span>

            <span className="text-gray-300">•</span>

            <span className="inline-flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  page.isPublished ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {page.isPublished ? "Published" : "Draft"}
            </span>

            <span className="text-gray-300">•</span>

            <span>{sectionCount} section{sectionCount !== 1 ? "s" : ""}</span>

            <span className="text-gray-300">•</span>

            <span>Updated {timeAgo(page.updatedAt)}</span>

            {isDirty && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveStatus === "saved" && (
            <span className="text-xs font-medium text-green-600">
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      <form
        id="edit-page-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start"
      >
        {/* MAIN COLUMN */}
        <div className="space-y-6 min-w-0">

          {/* TITLE & SLUG CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Page Title
                </label>
                <span
                  className={`text-xs tabular-nums ${
                    (page.title || "").length > TITLE_MAX
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {(page.title || "").length} / {TITLE_MAX}
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={page.title || ""}
                onChange={handleChange}
                maxLength={TITLE_MAX}
                placeholder="Enter page title"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Slug
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-colors">
                <span className="px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-300 shrink-0">
                  /
                </span>
                <input
                  type="text"
                  name="slug"
                  value={page.slug || ""}
                  onChange={handleChange}
                  placeholder="page-slug"
                  className="w-full px-3.5 py-2.5 text-sm font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* PAGE BUILDER CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {sectionCount === 0 ? (
              <div 
                onClick={() => setShowSectionModal(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg py-14 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-500 mb-3">No sections yet.</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSectionModal(true);
                  }}
                  className="text-sm font-medium text-gray-900 hover:text-black underline underline-offset-2"
                >
                  + Add your first section
                </button>
              </div>
            ) : (
              <DynamicPageEditor
                sections={page.sections || []}
                setSections={(sections) =>
                  setPage((prev) => ({
                    ...prev,
                    sections,
                  }))
                }
                setShowSectionModal={setShowSectionModal}
              />
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* BUTTONS - Separate from status card, centered, no background */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || saveStatus === "saving"}
              className="text-red-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-[13px] font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>

            <button
              type="submit"
              form="edit-page-form"
              disabled={saveStatus === "saving" || isDeleting}
              className="bg-gray-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saveStatus === "saving" ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* STATUS CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </label>
              <select
                value={page.isPublished ? "published" : "draft"}
                onChange={(e) =>
                  setPage((prev) => ({
                    ...prev,
                    isPublished: e.target.value === "published",
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      {showSectionModal && (
        <AddSectionModal
          onSelect={handleAddSection}
          onClose={() => setShowSectionModal(false)}
        />
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default EditPage;