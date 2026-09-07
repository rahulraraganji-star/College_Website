import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSection } from "../utils/sectionFactory";
import DynamicPageEditor from "../components/DynamicPageEditor";
import CoursesEditor from "../editors/CoursesEditor";
import AddSectionModal from "../components/AddSectionModal";

const slugify = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const CreatePage = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    parentSlug: "academics",
    template: "default", // "default" | "courses"
    status: "published",
    isPublished: true,
    sections: [],
    courseData: {
      courses: [],
    },
  });

  // FETCH NAVIGATION MENUS
  useEffect(() => {
    fetch("/api/navigation/admin", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenus(data);
          if (data.length > 0 && !formData.parentSlug) {
            setFormData((prev) => ({
              ...prev,
              parentSlug: data[0].key || "academics",
            }));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load menus:", err);
      });
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" ? { isPublished: value === "published" } : {}),
    }));
  };

  const handleAddSection = (type) => {
    const newSection = createSection(type);
    if (!newSection) return;

    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setShowSectionModal(false);
  };

  // AUTO GENERATE SLUG ON TITLE CHANGE
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const generatedSlug = slugify(title);

    setFormData((prev) => ({
      ...prev,
      title,
      slug: generatedSlug,
    }));
  };

  // SAVE PAGE
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    const submissionData = { ...formData };
    if (submissionData.template === "courses") {
      submissionData.title = submissionData.title?.trim() || "Courses";
      submissionData.slug = submissionData.slug?.trim() || "courses";
      submissionData.kicker = submissionData.kicker || "Academic Programmes";
      submissionData.parentSlug = submissionData.parentSlug || "academics";
    }

    // VALIDATION
    if (!submissionData.title?.trim()) {
      alert("Page title is required");
      return;
    }
    if (!submissionData.slug?.trim()) {
      alert("Slug is required");
      return;
    }

    setSaveStatus("saving");

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveStatus("idle");
        alert(data.message || "Failed to create page");
        return;
      }

      setSaveStatus("saved");
      alert("Page created successfully!");

      // REFRESH NAVBAR
      window.dispatchEvent(new Event("navbarRefresh"));

      const createdPage = data?.page || data;

      // Stay in the admin panel by transitioning to the page editor
      if (createdPage?._id) {
        navigate(`/admin/pages/${createdPage._id}`, { replace: true });
      } else {
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error(error);
      setSaveStatus("idle");
      alert("Failed to create page");
    }
  };

  // ==========================================
  // COURSES TEMPLATE CREATION VIEW
  // ==========================================
  if (formData.template === "courses") {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Template Selector Switcher */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Page Type:
            </span>
            <div className="inline-flex bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    template: "default",
                  }))
                }
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition text-neutral-600 hover:text-black"
              >
                Default Page
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-black text-white shadow-sm"
              >
                Courses Page
              </button>
            </div>
          </div>
        </div>

        <CoursesEditor
          page={formData}
          setPage={setFormData}
          onSave={handleSubmit}
          saveStatus={saveStatus}
          menus={menus}
        />

        {showSectionModal && (
          <AddSectionModal
            onSelect={handleAddSection}
            onClose={() => setShowSectionModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // DEFAULT PAGE CREATION VIEW
  // ==========================================
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
            Pages
          </p>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight">Create Page</h1>
          <p className="text-[14px] text-neutral-500 mt-1.5">
            Configure page settings, slug, and initial layout structure.
          </p>
        </div>
        <button
          type="submit"
          form="create-page-form"
          disabled={saveStatus === "saving"}
          className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saveStatus === "saving" ? "Saving..." : "Save Page"}
        </button>
      </div>

      <form
        id="create-page-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start"
      >
        {/* MAIN COLUMN */}
        <div className="space-y-6 min-w-0">
          {/* TITLE & SLUG CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Page Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter page title"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Slug (Auto-Generated)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-colors">
                <span className="px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-300 shrink-0">
                  /
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="page-slug"
                  className="w-full px-3.5 py-2.5 text-sm font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* PAGE BUILDER CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {formData.sections.length === 0 ? (
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
                sections={formData.sections}
                setSections={(sections) =>
                  setFormData((prev) => ({
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
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Page Template / Type
              </label>
              <select
                name="template"
                value={formData.template || "default"}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white font-medium"
              >
                <option value="default">Default Page</option>
                <option value="courses">Courses</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Parent Category (parentSlug)
              </label>
              <select
                name="parentSlug"
                value={formData.parentSlug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
              >
                {menus.map((menu) => (
                  <option key={menu._id || menu.key} value={menu.key}>
                    {menu.title} ({menu.key})
                  </option>
                ))}
                <option value="academics">Academics (academics)</option>
                <option value="courses">Courses (courses)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
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

export default CreatePage;