import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicPageEditor from "../components/DynamicPageEditor";
import AddSectionModal from "../components/AddSectionModal";
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
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [isDeleting, setIsDeleting] = useState(false);

  // SNAPSHOT OF LAST SAVED STATE (FOR DIRTY CHECK)
  const savedSnapshotRef = useRef(null);

  const isDirty =
    page && savedSnapshotRef.current
      ? JSON.stringify(page) !== savedSnapshotRef.current
      : false;

  // FETCH PAGE
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/pages/id/${id}`,
          {
            credentials: "include", // ✅ FIXED: Send cookie
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch page");
        }

        const data = await res.json();

        setPage(data);
        savedSnapshotRef.current = JSON.stringify(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
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
    e.preventDefault();

    setSaveStatus("saving");

    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/${id}`,
        {
          method: "PUT",
          credentials: "include", // ✅ FIXED: Send cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(page),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update page");
      }

      const updatedPage = await response.json();

      setPage(updatedPage);
      savedSnapshotRef.current = JSON.stringify(updatedPage);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setSaveStatus("idle");
      alert("Failed to update page");
    }
  };

  // DELETE PAGE
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/${id}`,
        {
          method: "DELETE",
          credentials: "include", // ✅ FIXED: Send cookie
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      navigate("/pages");
    } catch (error) {
      console.error(error);
      alert("Failed to delete page");
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

  const sectionCount = page.sections?.length || 0;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Pages
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Page
          </h1>

          {/* PAGE METADATA */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-[12px] text-gray-400">
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
    </div>
  );
};

export default EditPage;