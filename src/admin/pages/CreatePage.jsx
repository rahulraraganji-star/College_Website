import { createSection } from "../utils/sectionFactory";
import DynamicPageEditor from "../components/DynamicPageEditor";
import AddSectionModal from "../components/AddSectionModal";
import { useEffect, useState } from "react";

const CreatePage = () => {
  const [menus, setMenus] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    parentSlug: "",
    status: "published",
    sections: [],
  });

  // FETCH NAVIGATION MENUS
  useEffect(() => {
    fetch("http://localhost:5000/api/navigation/admin")
      .then((res) => res.json())
      .then((data) => {
        setMenus(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSection = (type) => {
    const newSection = createSection(type);
    if (!newSection) return;

    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        newSection,
      ],
    }));

    setShowSectionModal(false);
  };

  // AUTO GENERATE SLUG
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    }));
  };

  // SAVE PAGE
  const handleSubmit = async (e) => {
    e.preventDefault();
    // VALIDATION
    if (!formData.title.trim()) {
      alert("Page title is required");
      return;
    }
    if (!formData.slug.trim()) {
      alert("Slug is required");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/pages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      // HANDLE ERRORS
      if (!response.ok) {
        alert(
          data.message ||
          "Failed to create page"
        );
        return;
      }
      console.log(data);
      alert("Page created successfully!");
      // REFRESH NAVBAR
      window.dispatchEvent(
        new Event("navbarRefresh")
      );
      // RESET FORM
      setFormData({
        title: "",
        slug: "",
        parentSlug: "",
        status: "published",
        sections: [],
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create page");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Pages
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Page
          </h1>
        </div>
        <button
          type="submit"
          form="create-page-form"
          className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Save Page
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
                Slug
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
                  setFormData(prev => ({
                    ...prev,
                    sections
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
                Parent Category
              </label>
              <select
                name="parentSlug"
                value={formData.parentSlug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
              >
                <option value="">
                  None
                </option>
                {menus.map((menu) => (
                  <option
                    key={menu._id}
                    value={menu.key}
                  >
                    {menu.title}
                  </option>
                ))}
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
                <option value="published">
                  Published
                </option>
                <option value="draft">
                  Draft
                </option>
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