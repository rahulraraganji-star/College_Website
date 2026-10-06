import { useState, useMemo } from "react";
import MediaPicker from "../media/components/MediaPicker";
import CoursesTemplate from "../../Components/Courses/CoursesTemplate";
import CoursesDirectory from "../../Components/Courses/CoursesDirectory";
import "./courses-admin.css";

const slugify = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const CoursesEditor = ({ page, setPage, onSave, saveStatus = "idle", menus = [] }) => {
  // Current view:
  // - 'directory' (Parent categories list + page metadata)
  // - 'category-courses' (Managing inner courses within a selected parent category)
  // - 'editor' (Editing an individual programme with the 5 tabs)
  const [currentView, setCurrentView] = useState("directory");

  // Selected parent category index being viewed or managed
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);

  // Active course index being edited within the active category
  const [activeCourseIndex, setActiveCourseIndex] = useState(null);

  // Active Tab inside the individual course editor ('general' | 'overview' | 'highlights' | 'curriculum' | 'settings')
  const [activeEditorTab, setActiveEditorTab] = useState("general");

  // Accordion state for Year cards in curriculum tab
  const [openYears, setOpenYears] = useState({ 0: true });

  // Parent Category Create / Edit Modal State
  const [categoryModal, setCategoryModal] = useState({
    open: false,
    mode: "create", // "create" | "edit"
    index: null,
    data: {
      title: "",
      code: "",
      subtitle: "",
      badge: "",
      description: "",
      image: null,
      order: 1,
    },
  });

  // Syllabus Modal State
  const [syllabusModal, setSyllabusModal] = useState({
    open: false,
    yearIdx: null,
    semIdx: null,
    subIdx: null,
    data: null,
  });

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Normalize courseData to ensure categories structure while supporting legacy flat courses
  const categoriesList = useMemo(() => {
    const courseData = page?.courseData || {};

    // 1. If categories array exists
    if (Array.isArray(courseData.categories)) {
      if (courseData.categories.length > 0) {
        return courseData.categories;
      }
      if (Array.isArray(courseData.courses) && courseData.courses.length > 0) {
        return [
          {
            id: "cat-default-degree",
            title: "Degree & Academic Programmes",
            code: "UG/PG",
            slug: "degree-programmes",
            subtitle: "Undergraduate & Postgraduate Degrees",
            badge: "Degree",
            description:
              "Comprehensive academic degree programmes designed to provide strong theoretical foundations and practical career competencies.",
            image: null,
            order: 1,
            courses: courseData.courses,
          },
        ];
      }
      return [];
    }

    // 2. If legacy flat courses exist, normalize into a default category
    if (Array.isArray(courseData.courses) && courseData.courses.length > 0) {
      return [
        {
          id: "cat-default-degree",
          title: "Degree & Academic Programmes",
          code: "UG/PG",
          slug: "degree-programmes",
          subtitle: "Undergraduate & Postgraduate Degrees",
          badge: "Degree",
          description:
            "Comprehensive academic degree programmes designed to provide strong theoretical foundations and practical career competencies.",
          image: null,
          order: 1,
          courses: courseData.courses,
        },
      ];
    }

    return [];
  }, [page?.courseData]);

  // Helper updater for entire categories structure
  const updateCategoriesList = (newCategories) => {
    const flattenedCourses = newCategories.flatMap((cat) => cat.courses || []);
    setPage((prev) => ({
      ...prev,
      courseData: {
        ...(prev.courseData || {}),
        categories: newCategories,
        courses: flattenedCourses,
      },
    }));
  };

  // Sync page title and auto-generate slug
  const handlePageTitleChange = (e) => {
    const title = e.target.value;
    const autoSlug = slugify(title);
    setPage((prev) => ({
      ...prev,
      title,
      slug: autoSlug,
    }));
  };

  // =========================================================================
  // CATEGORY OPERATIONS
  // =========================================================================

  // Open Category Modal for Creating
  const openCreateCategoryModal = () => {
    setCategoryModal({
      open: true,
      mode: "create",
      index: null,
      data: {
        title: "",
        code: "",
        subtitle: "",
        badge: "",
        description: "",
        image: null,
        order: categoriesList.length + 1,
      },
    });
  };

  // Open Category Modal for Editing
  const openEditCategoryModal = (catIdx, e) => {
    if (e) e.stopPropagation();
    const cat = categoriesList[catIdx];
    setCategoryModal({
      open: true,
      mode: "edit",
      index: catIdx,
      data: {
        title: cat.title || "",
        code: cat.code || "",
        subtitle: cat.subtitle || "",
        badge: cat.badge || "",
        description: cat.description || "",
        image: cat.image || null,
        order: cat.order ?? catIdx + 1,
      },
    });
  };

  // Save Category from Modal
  const saveCategoryModal = () => {
    const { mode, index, data } = categoryModal;
    if (!data.title || !data.title.trim()) {
      alert("Please enter a title for the Parent Category.");
      return;
    }

    const updatedCategories = [...categoriesList];

    if (mode === "create") {
      const newCat = {
        id: `cat-${Date.now()}`,
        title: data.title.trim(),
        code: data.code?.trim() || "",
        slug: slugify(data.title),
        subtitle: data.subtitle?.trim() || "",
        badge: data.badge?.trim() || data.code?.trim() || "Academic",
        description: data.description?.trim() || "",
        image: data.image || null,
        order: Number(data.order) || updatedCategories.length + 1,
        courses: [],
      };
      updatedCategories.push(newCat);
    } else if (mode === "edit" && index !== null) {
      const existing = updatedCategories[index];
      updatedCategories[index] = {
        ...existing,
        title: data.title.trim(),
        code: data.code?.trim() || "",
        slug: existing.slug || slugify(data.title),
        subtitle: data.subtitle?.trim() || "",
        badge: data.badge?.trim() || data.code?.trim() || "Academic",
        description: data.description?.trim() || "",
        image: data.image || null,
        order: Number(data.order) || index + 1,
      };
    }

    updateCategoriesList(updatedCategories);
    setCategoryModal({ open: false, mode: "create", index: null, data: {} });
  };

  // Delete Category
  const deleteCategory = (catIdx, e) => {
    if (e) e.stopPropagation();
    const cat = categoriesList[catIdx];
    const courseCount = (cat.courses || []).length;

    const confirmMsg =
      courseCount > 0
        ? `Are you sure you want to remove "${cat.title}" and its ${courseCount} inner programme(s)?`
        : `Are you sure you want to remove the category "${cat.title}"?`;

    if (window.confirm(confirmMsg)) {
      const updated = categoriesList.filter((_, i) => i !== catIdx);
      updateCategoriesList(updated);
      if (activeCategoryIndex === catIdx) {
        setCurrentView("directory");
        setActiveCategoryIndex(null);
        setActiveCourseIndex(null);
      }
    }
  };

  // View Inner Courses for a Category
  const openCategoryCourses = (catIdx) => {
    setActiveCategoryIndex(catIdx);
    setCurrentView("category-courses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================================================
  // COURSE (PROGRAMME) OPERATIONS
  // =========================================================================

  // Add new course inside the active parent category
  const addNewProgramme = (catIdx) => {
    const targetCatIdx = catIdx !== undefined ? catIdx : activeCategoryIndex;
    if (targetCatIdx === null || targetCatIdx === undefined) return;

    const targetCat = categoriesList[targetCatIdx];
    const newProg = {
      id: `prog-${Date.now()}`,
      courseName: "",
      courseCode: "",
      slug: "",
      level: targetCat.badge || targetCat.code || "Undergraduate",
      duration: "3 Years",
      semesters: 6,
      eligibility: "12th Pass",
      mode: "Full Time",
      status: "published",
      image: "",
      shortDescription: "",
      overview: {
        description: "",
        learningOutcomes: "",
        careerOpportunities: "",
      },
      highlights: [],
      curriculum: [],
      curriculumPdf: "",
      order: (targetCat.courses || []).length + 1,
    };

    const updatedCategories = [...categoriesList];
    const catCourses = [...(updatedCategories[targetCatIdx].courses || []), newProg];
    updatedCategories[targetCatIdx] = {
      ...updatedCategories[targetCatIdx],
      courses: catCourses,
    };

    updateCategoriesList(updatedCategories);
    setActiveCategoryIndex(targetCatIdx);
    setActiveCourseIndex(catCourses.length - 1);
    setActiveEditorTab("general");
    setCurrentView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Course Editor
  const openCourseEditor = (catIdx, courseIdx) => {
    setActiveCategoryIndex(catIdx);
    setActiveCourseIndex(courseIdx);
    setActiveEditorTab("general");
    setCurrentView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper updater for the active course being edited
  const updateActiveCourse = (field, value) => {
    if (activeCategoryIndex === null || activeCourseIndex === null) return;

    const updatedCategories = [...categoriesList];
    const cat = updatedCategories[activeCategoryIndex];
    const courses = [...(cat.courses || [])];
    const current = { ...courses[activeCourseIndex], [field]: value };

    // Auto sync slug whenever courseName changes
    if (field === "courseName") {
      current.slug = slugify(value);
    }

    courses[activeCourseIndex] = current;
    updatedCategories[activeCategoryIndex] = {
      ...cat,
      courses,
    };

    updateCategoriesList(updatedCategories);
  };

  // Delete Course
  const deleteCourse = (catIdx, courseIdx, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this programme?")) {
      const updatedCategories = [...categoriesList];
      const cat = updatedCategories[catIdx];
      const courses = (cat.courses || []).filter((_, i) => i !== courseIdx);
      updatedCategories[catIdx] = { ...cat, courses };

      updateCategoriesList(updatedCategories);
      if (activeCategoryIndex === catIdx && activeCourseIndex === courseIdx) {
        setCurrentView("category-courses");
        setActiveCourseIndex(null);
      }
    }
  };

  // Move course to a different category
  const moveCourseToCategory = (targetCatIdx) => {
    if (activeCategoryIndex === null || activeCourseIndex === null || targetCatIdx === activeCategoryIndex)
      return;

    const updatedCategories = [...categoriesList];
    const sourceCat = updatedCategories[activeCategoryIndex];
    const destCat = updatedCategories[targetCatIdx];

    const courseToMove = sourceCat.courses[activeCourseIndex];
    const newSourceCourses = sourceCat.courses.filter((_, i) => i !== activeCourseIndex);
    const newDestCourses = [...(destCat.courses || []), courseToMove];

    updatedCategories[activeCategoryIndex] = { ...sourceCat, courses: newSourceCourses };
    updatedCategories[targetCatIdx] = { ...destCat, courses: newDestCourses };

    updateCategoriesList(updatedCategories);
    setActiveCategoryIndex(targetCatIdx);
    setActiveCourseIndex(newDestCourses.length - 1);
  };

  // =========================================================================
  // VALIDATION & SAVE
  // =========================================================================

  const validateAndSave = () => {
    if (categoriesList.length === 0) {
      alert("Please add at least one Parent Category (e.g. Bachelor's Degree, Ph.D, Distance Education).");
      return;
    }

    // Validate Categories and Inner Courses
    for (let c = 0; c < categoriesList.length; c++) {
      const cat = categoriesList[c];
      const catTitle = cat.title?.trim() || `Category #${c + 1}`;

      if (!cat.title || !cat.title.trim()) {
        alert(`Please enter a title for Parent Category #${c + 1}.`);
        setCurrentView("directory");
        return;
      }

      const courses = cat.courses || [];
      for (let i = 0; i < courses.length; i++) {
        const prog = courses[i];
        const progName = prog.courseName?.trim() || `Programme #${i + 1} under "${catTitle}"`;

        // 1. Check Course Name
        if (!prog.courseName || !prog.courseName.trim()) {
          alert(`Please enter a Course Name for ${progName}.`);
          openCourseEditor(c, i);
          setActiveEditorTab("general");
          return;
        }

        // 2. Check Short Description
        if (!prog.shortDescription || !prog.shortDescription.trim()) {
          alert(`Please write a Short Description for "${progName}".`);
          openCourseEditor(c, i);
          setActiveEditorTab("general");
          return;
        }

        // 3. Check Inner Overview Description
        const hasOverview = Boolean(
          prog.overview?.description?.trim() || prog.overview?.learningOutcomes?.trim()
        );
        if (!hasOverview) {
          alert(`Please write inner data (Programme Overview Description) for "${progName}".`);
          openCourseEditor(c, i);
          setActiveEditorTab("overview");
          return;
        }

        // Curriculum is optional: admins can add detailed year modules, or a Curriculum PDF, or neither
      }
    }

    // Validation passed -> trigger save
    onSave?.();
  };

  // Active Category & Course references
  const activeCategory =
    activeCategoryIndex !== null && activeCategoryIndex < categoriesList.length
      ? categoriesList[activeCategoryIndex]
      : null;

  const activeCourse =
    activeCategory && activeCourseIndex !== null && activeCourseIndex < (activeCategory.courses || []).length
      ? activeCategory.courses[activeCourseIndex]
      : null;

  return (
    <div className="courses-admin-scope">
      {/* =====================================================
           1. DIRECTORY PAGE VIEW (Parent Categories Management)
      ====================================================== */}
      {currentView === "directory" && (
        <section id="directory" className="directory">
          {/* Top Page Header */}
          <div className="page-header">
            <div>
              <div className="kicker">Course Management</div>
              <h1>{page?.title || "Courses"}</h1>
              <p>Manage parent degree categories and individual academic programmes.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPreviewModalOpen(true)}
              >
                Preview Directory
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={validateAndSave}
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Page"}
              </button>
            </div>
          </div>

          {/* Directory Settings Card */}
          <div className="directory-card">
            <div className="card-header">
              <div>
                <h3>Course Directory Settings</h3>
                <span>Controls the public /courses page header and metadata</span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPreviewModalOpen(true)}
                >
                  Preview Page
                </button>
              </div>
            </div>

            <div className="directory-body">
              <div className="form-grid">
                <div className="field">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={page?.title ?? "Courses"}
                    onChange={handlePageTitleChange}
                    placeholder="Courses"
                  />
                </div>

                <div className="field">
                  <label>Kicker / Eyebrow</label>
                  <input
                    type="text"
                    value={page?.kicker || "Academic Programmes & Faculties"}
                    onChange={(e) => setPage((prev) => ({ ...prev, kicker: e.target.value }))}
                    placeholder="Academic Programmes & Faculties"
                  />
                </div>

                <div className="field">
                  <label>Page Slug (Auto-Generated)</label>
                  <input
                    type="text"
                    value={page?.slug || "courses"}
                    onChange={(e) => setPage((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="courses"
                  />
                </div>

                <div className="field">
                  <label>Parent Category (parentSlug)</label>
                  <select
                    value={page?.parentSlug || "academics"}
                    onChange={(e) => setPage((prev) => ({ ...prev, parentSlug: e.target.value }))}
                  >
                    {menus.map((m) => (
                      <option key={m._id || m.key} value={m.key}>
                        {m.title} ({m.key})
                      </option>
                    ))}
                    <option value="academics">Academics (academics)</option>
                    <option value="courses">Courses (courses)</option>
                  </select>
                </div>

                <div className="field full">
                  <label>Description</label>
                  <textarea
                    value={
                      page?.description ||
                      "Explore our academic programmes across diverse degree levels, doctoral studies, and flexible distance education opportunities."
                    }
                    onChange={(e) => setPage((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
               PARENT CATEGORIES SECTION (Outer Cards)
          ====================================================== */}
          <div className="section-heading">
            <div>
              <h2>Parent Categories (Degree Types)</h2>
              <span>
                {categoriesList.length} {categoriesList.length === 1 ? "category" : "categories"} (e.g. Bachelor's Degree, Ph.D, Distance Education)
              </span>
            </div>

            <button type="button" className="btn btn-gold" onClick={openCreateCategoryModal}>
              + Add Parent Category
            </button>
          </div>

          <div className="category-list" style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
            {categoriesList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 20px",
                  background: "#fff",
                  border: "1px dashed var(--border)",
                  borderRadius: "4px",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: "14px", marginBottom: "14px", color: "#666" }}>
                  No parent categories have been created yet. Create categories like Bachelor's Degree, Ph.D, or Distance Education to organize your courses.
                </p>
                <button type="button" className="btn btn-gold" onClick={openCreateCategoryModal}>
                  + Add Parent Category
                </button>
              </div>
            ) : (
              categoriesList.map((cat, catIdx) => {
                const courseCount = (cat.courses || []).length;
                const catImgUrl =
                  (typeof cat.image === "object" ? cat.image?.url : cat.image) || "";

                return (
                  <div key={cat.id || catIdx} className="category-row">
                    {/* Category Thumbnail / Watermark */}
                    <div
                      className="category-thumbnail"
                      style={{
                        backgroundImage: catImgUrl ? `url(${catImgUrl})` : "none",
                        backgroundColor: "#ece8e1",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#525252",
                        fontWeight: 700,
                        fontSize: "14px",
                        borderRadius: "2px",
                      }}
                    >
                      {!catImgUrl && <span>{cat.code || String(catIdx + 1).padStart(2, "0")}</span>}
                    </div>

                    {/* Category Info */}
                    <div className="category-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ margin: 0 }}>{cat.title}</h3>
                        {cat.badge && (
                          <span className="category-badge-pill">{cat.badge}</span>
                        )}
                      </div>

                      {cat.subtitle && (
                        <div className="category-subtitle">{cat.subtitle}</div>
                      )}

                      {cat.description && (
                        <p className="category-description-preview">{cat.description}</p>
                      )}

                      <div className="category-meta">
                        <span>
                          <strong>{courseCount}</strong> {courseCount === 1 ? "Programme" : "Programmes"} inside
                        </span>
                        {cat.code && <span>Code: {cat.code}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="category-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openCategoryCourses(catIdx)}
                      >
                        Manage Courses ({courseCount}) →
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={(e) => openEditCategoryModal(catIdx, e)}
                      >
                        Edit Category
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={(e) => deleteCategory(catIdx, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* =====================================================
           2. CATEGORY COURSES VIEW (Inner Cards for Selected Category)
      ====================================================== */}
      {currentView === "category-courses" && activeCategory && (
        <section id="categoryCourses" className="directory">
          {/* Breadcrumb Header */}
          <div className="page-header" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setCurrentView("directory");
                  setActiveCategoryIndex(null);
                }}
                title="Back to All Parent Categories"
              >
                ←
              </button>

              <div>
                <div className="kicker">
                  {activeCategory.badge || "Academic Category"} · Parent Card
                </div>
                <h1>{activeCategory.title}</h1>
                <p>
                  Manage the programmes and inner course cards for this category.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => openEditCategoryModal(activeCategoryIndex)}
              >
                Edit Category Info
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={validateAndSave}
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Page"}
              </button>
            </div>
          </div>

          {/* Programmes List within Category */}
          <div className="section-heading">
            <div>
              <h2>Inner Programmes in {activeCategory.title}</h2>
              <span>
                {(activeCategory.courses || []).length}{" "}
                {(activeCategory.courses || []).length === 1 ? "programme" : "programmes"}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-gold"
              onClick={() => addNewProgramme(activeCategoryIndex)}
            >
              + Add Programme
            </button>
          </div>

          <div className="course-list">
            {(!activeCategory.courses || activeCategory.courses.length === 0) ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 20px",
                  background: "#fff",
                  border: "1px dashed var(--border)",
                  borderRadius: "4px",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: "14px", marginBottom: "14px", color: "#666" }}>
                  No programmes have been added under "{activeCategory.title}" yet.
                </p>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => addNewProgramme(activeCategoryIndex)}
                >
                  + Add First Programme
                </button>
              </div>
            ) : (
              activeCategory.courses.map((course, idx) => {
                const imgUrl =
                  (typeof course.image === "object" ? course.image?.url : course.image) || "";

                return (
                  <div key={course.id || idx} className="course-row">
                    <div
                      className="course-image"
                      style={{
                        backgroundImage: imgUrl ? `url(${imgUrl})` : "none",
                        backgroundColor: "#f0ede6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#525252",
                        fontWeight: 700,
                        fontSize: "14px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!imgUrl && (
                        <span>{course.courseCode || String(idx + 1).padStart(2, "0")}</span>
                      )}
                    </div>

                    <div className="course-info">
                      <h3>{course.courseName || "Untitled Programme"}</h3>
                      <div className="course-code">{course.courseCode || "CODE"}</div>
                      <div className="course-meta">
                        <span>{course.duration || "3 Years"}</span>
                        <span>{course.semesters ? `${course.semesters} Semesters` : "6 Semesters"}</span>
                        <span>{course.level || activeCategory.badge || "Undergraduate"}</span>
                      </div>
                    </div>

                    <div className="course-actions">
                      <span className={`status ${course.status === "draft" ? "draft" : ""}`}>
                        {course.status === "draft" ? "Draft" : "Published"}
                      </span>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => openCourseEditor(activeCategoryIndex, idx)}
                      >
                        Edit Course
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={(e) => deleteCourse(activeCategoryIndex, idx, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* =====================================================
           3. INDIVIDUAL COURSE EDITOR VIEW (#editor)
      ====================================================== */}
      {currentView === "editor" && activeCourse && (
        <section id="editor" className="editor active">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="editor-course">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setCurrentView("category-courses");
                  setActiveCourseIndex(null);
                }}
                title="Back to Category Courses"
              >
                ←
              </button>

              <div>
                <h2>{activeCourse.courseName || "Programme Name"}</h2>
                <p>
                  {activeCourse.courseCode || "CODE"} · Category: {activeCategory?.title} · /{page?.slug || "courses"}/
                  {activeCourse.slug || "slug"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPreviewModalOpen(true)}
              >
                Preview
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={validateAndSave}
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs">
            <button
              type="button"
              className={`tab ${activeEditorTab === "general" ? "active" : ""}`}
              onClick={() => setActiveEditorTab("general")}
            >
              General
            </button>

            <button
              type="button"
              className={`tab ${activeEditorTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveEditorTab("overview")}
            >
              Overview
            </button>

            <button
              type="button"
              className={`tab ${activeEditorTab === "highlights" ? "active" : ""}`}
              onClick={() => setActiveEditorTab("highlights")}
            >
              Highlights
            </button>

            <button
              type="button"
              className={`tab ${activeEditorTab === "curriculum" ? "active" : ""}`}
              onClick={() => setActiveEditorTab("curriculum")}
            >
              Curriculum
            </button>

            <button
              type="button"
              className={`tab ${activeEditorTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveEditorTab("settings")}
            >
              Settings
            </button>
          </div>

          {/* TAB 1: GENERAL */}
          {activeEditorTab === "general" && (
            <div id="general" className="tab-content active">
              <div className="editor-panel">
                <h2 className="panel-title">General Information</h2>
                <p className="panel-description">
                  Basic information used across the course card and course detail page.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Course Name</label>
                    <input
                      type="text"
                      value={activeCourse.courseName || ""}
                      onChange={(e) => updateActiveCourse("courseName", e.target.value)}
                      placeholder="e.g. Bachelor of Computer Applications"
                    />
                  </div>

                  <div className="field">
                    <label>Course Code</label>
                    <input
                      type="text"
                      value={activeCourse.courseCode || ""}
                      onChange={(e) => updateActiveCourse("courseCode", e.target.value)}
                      placeholder="e.g. BCA"
                    />
                  </div>

                  <div className="field">
                    <label>Slug (Auto-generated from Course Name)</label>
                    <input
                      type="text"
                      value={activeCourse.slug || slugify(activeCourse.courseName || "")}
                      onChange={(e) => updateActiveCourse("slug", e.target.value)}
                      placeholder="auto-generated"
                    />
                  </div>

                  <div className="field">
                    <label>Parent Category</label>
                    <select
                      value={activeCategoryIndex}
                      onChange={(e) => moveCourseToCategory(Number(e.target.value))}
                    >
                      {categoriesList.map((cat, idx) => (
                        <option key={cat.id || idx} value={idx}>
                          {cat.title} ({cat.badge || cat.code || `Cat #${idx + 1}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={activeCourse.duration || "3 Years"}
                      onChange={(e) => updateActiveCourse("duration", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Number of Semesters</label>
                    <input
                      type="number"
                      value={activeCourse.semesters || 6}
                      onChange={(e) => updateActiveCourse("semesters", Number(e.target.value))}
                    />
                  </div>

                  <div className="field">
                    <label>Level</label>
                    <select
                      value={activeCourse.level || "Undergraduate"}
                      onChange={(e) => updateActiveCourse("level", e.target.value)}
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Doctoral / Ph.D">Doctoral / Ph.D</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Distance Education">Distance Education</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Eligibility</label>
                    <input
                      type="text"
                      value={activeCourse.eligibility || "12th Pass"}
                      onChange={(e) => updateActiveCourse("eligibility", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Mode</label>
                    <select
                      value={activeCourse.mode || "Full Time"}
                      onChange={(e) => updateActiveCourse("mode", e.target.value)}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Distance / Online">Distance / Online</option>
                    </select>
                  </div>

                  <div className="field full my-2">
                    <MediaPicker
                      label="Cover / Featured Image"
                      type="image"
                      multiple={false}
                      value={activeCourse.image || null}
                      onChange={(media) => {
                        updateActiveCourse("image", media);
                      }}
                    />
                  </div>

                  <div className="field full">
                    <label>Short Description</label>
                    <textarea
                      value={activeCourse.shortDescription || ""}
                      onChange={(e) => updateActiveCourse("shortDescription", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeEditorTab === "overview" && (
            <div id="overview" className="tab-content active">
              <div className="editor-panel">
                <h2 className="panel-title">Programme Overview</h2>
                <p className="panel-description">Content displayed on the course detail page.</p>

                <div className="field">
                  <label>Programme Description</label>
                  <textarea
                    style={{ height: "180px" }}
                    value={activeCourse.overview?.description || ""}
                    onChange={(e) =>
                      updateActiveCourse("overview", {
                        ...(activeCourse.overview || {}),
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <br />

                <div className="field">
                  <label>Learning Outcomes</label>
                  <textarea
                    style={{ height: "180px" }}
                    value={
                      typeof activeCourse.overview?.learningOutcomes === "string"
                        ? activeCourse.overview.learningOutcomes
                        : Array.isArray(activeCourse.overview?.learningOutcomes)
                        ? activeCourse.overview.learningOutcomes.join("\n")
                        : ""
                    }
                    onChange={(e) =>
                      updateActiveCourse("overview", {
                        ...(activeCourse.overview || {}),
                        learningOutcomes: e.target.value,
                      })
                    }
                  />
                </div>

                <br />

                <div className="field">
                  <label>Career Opportunities</label>
                  <textarea
                    style={{ height: "120px" }}
                    value={
                      typeof activeCourse.overview?.careerOpportunities === "string"
                        ? activeCourse.overview.careerOpportunities
                        : Array.isArray(activeCourse.overview?.careerOpportunities)
                        ? activeCourse.overview.careerOpportunities.join("\n")
                        : ""
                    }
                    onChange={(e) =>
                      updateActiveCourse("overview", {
                        ...(activeCourse.overview || {}),
                        careerOpportunities: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HIGHLIGHTS */}
          {activeEditorTab === "highlights" && (
            <div id="highlights" className="tab-content active">
              <div className="editor-panel">
                <div className="section-heading">
                  <div>
                    <h2 className="panel-title">Programme Highlights</h2>
                    <p className="panel-description">
                      These appear as key statistic and feature highlight cards on the course page.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const list = [
                        ...(activeCourse.highlights || []),
                        { number: "01", title: "", description: "" },
                      ];
                      updateActiveCourse("highlights", list);
                    }}
                  >
                    + Add Highlight
                  </button>
                </div>

                <div
                  className="highlights-editor-list"
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  {!activeCourse.highlights || activeCourse.highlights.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "35px 20px",
                        background: "#f9fafb",
                        border: "1px dashed var(--border)",
                        borderRadius: "4px",
                        color: "#888",
                      }}
                    >
                      <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                        No highlights added yet.
                      </p>
                      <button
                        type="button"
                        className="btn btn-gold"
                        onClick={() => {
                          const list = [
                            ...(activeCourse.highlights || []),
                            { number: "01", title: "", description: "" },
                          ];
                          updateActiveCourse("highlights", list);
                        }}
                      >
                        + Add Highlight
                      </button>
                    </div>
                  ) : (
                    activeCourse.highlights.map((hl, hIdx) => (
                      <div
                        key={hIdx}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          padding: "18px 20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              color: "#171717",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Highlight #{hIdx + 1}
                          </span>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                            onClick={() => {
                              const list = activeCourse.highlights.filter((_, i) => i !== hIdx);
                              updateActiveCourse("highlights", list);
                            }}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="form-grid" style={{ gridTemplateColumns: "110px 1fr" }}>
                          <div className="field">
                            <label>Metric / No.</label>
                            <input
                              type="text"
                              value={hl.number || ""}
                              placeholder="e.g. 06, 30+, 100%"
                              onChange={(e) => {
                                const list = [...activeCourse.highlights];
                                list[hIdx] = { ...list[hIdx], number: e.target.value };
                                updateActiveCourse("highlights", list);
                              }}
                            />
                          </div>

                          <div className="field">
                            <label>Highlight Title</label>
                            <input
                              type="text"
                              value={hl.title || ""}
                              placeholder="e.g. Semesters, Practical Labs, Global Certification"
                              onChange={(e) => {
                                const list = [...activeCourse.highlights];
                                list[hIdx] = { ...list[hIdx], title: e.target.value };
                                updateActiveCourse("highlights", list);
                              }}
                            />
                          </div>
                        </div>

                        <div className="field full">
                          <label>Description</label>
                          <textarea
                            rows={2}
                            value={hl.description || ""}
                            placeholder="Brief description of this highlight..."
                            onChange={(e) => {
                              const list = [...activeCourse.highlights];
                              list[hIdx] = { ...list[hIdx], description: e.target.value };
                              updateActiveCourse("highlights", list);
                            }}
                            style={{ height: "60px", minHeight: "60px" }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CURRICULUM */}
          {activeEditorTab === "curriculum" && (
            <div id="curriculum" className="tab-content active">
              <div className="editor-panel">
                <div className="curriculum-actions">
                  <div>
                    <h2 className="panel-title">Curriculum</h2>
                    <p className="panel-description">
                      Manage years, semesters, subjects and syllabi, or attach a Curriculum PDF.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const cur = [...(activeCourse.curriculum || [])];
                      const nextYearNum = cur.length + 1;
                      cur.push({
                        id: `year-${Date.now()}`,
                        yearNumber: String(nextYearNum).padStart(2, "0"),
                        yearName: `Year ${nextYearNum}`,
                        subtitle: "Core Studies & Practical Electives",
                        semesters: [
                          {
                            id: `sem-${Date.now()}-1`,
                            semesterName: `Semester ${nextYearNum * 2 - 1}`,
                            subjects: [],
                          },
                          {
                            id: `sem-${Date.now()}-2`,
                            semesterName: `Semester ${nextYearNum * 2}`,
                            subjects: [],
                          },
                        ],
                      });
                      updateActiveCourse("curriculum", cur);
                    }}
                  >
                    + Add Year
                  </button>
                </div>

                {/* Course-level Curriculum PDF Document Section */}
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1c1917",
                          margin: 0,
                        }}
                      >
                        📄 Programme Curriculum PDF (Optional)
                      </h3>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#78716c",
                          margin: "2px 0 0 0",
                        }}
                      >
                        Attach a full curriculum/syllabus PDF for this programme. You can use this alongside or instead of the detailed modules below.
                      </p>
                    </div>

                    <MediaPicker
                      label="Upload / Select PDF"
                      type="document"
                      value={activeCourse.curriculumPdf}
                      onChange={(media) => {
                        const pdfUrl = (typeof media === "object" ? media?.url : media) || "";
                        updateActiveCourse("curriculumPdf", pdfUrl);
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={
                        (typeof activeCourse.curriculumPdf === "object"
                          ? activeCourse.curriculumPdf?.url
                          : activeCourse.curriculumPdf) || ""
                      }
                      placeholder="Enter PDF URL or click 'Upload / Select PDF' above"
                      onChange={(e) => updateActiveCourse("curriculumPdf", e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: "13px",
                        background: "#fff",
                        border: "1px solid #ddd6ce",
                        borderRadius: "4px",
                      }}
                    />

                    {activeCourse.curriculumPdf && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                        onClick={() => updateActiveCourse("curriculumPdf", "")}
                      >
                        Remove PDF
                      </button>
                    )}
                  </div>

                  {activeCourse.curriculumPdf && (
                    <div style={{ marginTop: "8px" }}>
                      <a
                        href={
                          typeof activeCourse.curriculumPdf === "object"
                            ? activeCourse.curriculumPdf?.url
                            : activeCourse.curriculumPdf
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#171717",
                          fontWeight: 600,
                          textDecoration: "underline",
                        }}
                      >
                        ↗ View Attached Curriculum PDF Document
                      </a>
                    </div>
                  )}
                </div>

                {/* Empty State when no years are present */}
                {(!activeCourse.curriculum || activeCourse.curriculum.length === 0) && (
                  <div
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "#78716c",
                      background: "#f9fafb",
                      border: "1px dashed #d6d3d1",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 600, color: "#444" }}>
                      No Detailed Curriculum Modules
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                      You can click "+ Add Year" above to enter year-wise modules, or use the Curriculum PDF option above. If both are empty, the Curriculum section will not be shown on the course page.
                    </p>
                  </div>
                )}

                {(activeCourse.curriculum || []).map((year, yIdx) => {
                  const isOpen = Boolean(openYears[yIdx]);

                  return (
                    <div key={year.id || yIdx} className={`year ${isOpen ? "open" : ""}`}>
                      <div
                        className="year-header"
                        onClick={() =>
                          setOpenYears((prev) => ({ ...prev, [yIdx]: !prev[yIdx] }))
                        }
                      >
                        <div className="year-left">
                          <div className="year-number">
                            {year.yearNumber || String(yIdx + 1).padStart(2, "0")}
                          </div>

                          <div>
                            <h3>{year.yearName || `Year ${yIdx + 1}`}</h3>
                            <p>{year.subtitle || "Foundation & Core Concepts"}</p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Delete Year"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete Year ${yIdx + 1} and its subjects?`)) {
                                const cur = [...(activeCourse.curriculum || [])];
                                cur.splice(yIdx, 1);
                                updateActiveCourse("curriculum", cur);
                              }
                            }}
                            style={{
                              color: "#dc2626",
                              fontSize: "14px",
                              padding: "4px 8px",
                              lineHeight: 1,
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                          <span className="year-toggle-icon">{isOpen ? "−" : "+"}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="year-body">
                          {(year.semesters || []).map((sem, sIdx) => {
                            const subjects = sem.subjects || [];

                            return (
                              <div key={sem.id || sIdx} className="semester">
                                <div className="semester-header">
                                  <div className="semester-title">
                                    {sem.semesterName || `Semester ${sIdx + 1}`}
                                    <span>{subjects.length} Subjects</span>
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                      const cur = [...activeCourse.curriculum];
                                      cur[yIdx].semesters[sIdx].subjects.push({
                                        id: `sub-${Date.now()}`,
                                        name: "New Subject",
                                        type: "Theory + Practical",
                                        credits: 4,
                                        syllabus: [],
                                      });
                                      updateActiveCourse("curriculum", cur);
                                    }}
                                  >
                                    + Subject
                                  </button>
                                </div>

                                <div className="subjects">
                                  {subjects.map((sub, subIdx) => {
                                    const hasSubPdf = Boolean(
                                      (typeof sub.syllabusPdf === "object"
                                        ? sub.syllabusPdf?.url
                                        : sub.syllabusPdf)?.trim()
                                    );
                                    const hasSubUnits =
                                      Array.isArray(sub.syllabus) && sub.syllabus.length > 0;
                                    const isPdfOnly =
                                      sub.syllabusMode === "pdf" || (hasSubPdf && !hasSubUnits);

                                    return (
                                      <div key={sub.id || subIdx} className="subject">
                                        <div className="subject-name">{sub.name}</div>
                                        <div className="subject-type">{sub.type || "Theory"}</div>
                                        <div className="subject-credit">
                                          {sub.credits || 4} Credits
                                          {isPdfOnly && (
                                            <span
                                              style={{
                                                marginLeft: "8px",
                                                fontSize: "10px",
                                                background: "#e8f0fe",
                                                color: "#1a73e8",
                                                padding: "2px 6px",
                                                borderRadius: "3px",
                                                fontWeight: 700,
                                                letterSpacing: "0.03em",
                                              }}
                                            >
                                              PDF ONLY
                                            </span>
                                          )}
                                          {!isPdfOnly && hasSubUnits && hasSubPdf && (
                                            <span
                                              style={{
                                                marginLeft: "8px",
                                                fontSize: "10px",
                                                background: "#fef3c7",
                                                color: "#92400e",
                                                padding: "2px 6px",
                                                borderRadius: "3px",
                                                fontWeight: 700,
                                                letterSpacing: "0.03em",
                                              }}
                                            >
                                              UNITS + PDF
                                            </span>
                                          )}
                                        </div>

                                        <div className="subject-actions">
                                        <button
                                          type="button"
                                          className="icon-btn"
                                          title="Edit Syllabus Units"
                                          onClick={() =>
                                            setSyllabusModal({
                                              open: true,
                                              yearIdx: yIdx,
                                              semIdx: sIdx,
                                              subIdx: subIdx,
                                              data: JSON.parse(JSON.stringify(sub)),
                                            })
                                          }
                                        >
                                          ☷
                                        </button>

                                        <button
                                          type="button"
                                          className="icon-btn"
                                          title="Delete"
                                          onClick={() => {
                                            const cur = [...activeCourse.curriculum];
                                            cur[yIdx].semesters[sIdx].subjects = cur[
                                              yIdx
                                            ].semesters[sIdx].subjects.filter(
                                              (_, i) => i !== subIdx
                                            );
                                            updateActiveCourse("curriculum", cur);
                                          }}
                                        >
                                          ✕
                                        </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeEditorTab === "settings" && (
            <div id="settings" className="tab-content active">
              <div className="editor-panel">
                <h2 className="panel-title">Course Settings</h2>
                <p className="panel-description">Publishing and visibility settings.</p>

                <div className="form-grid">
                  <div className="field">
                    <label>Status</label>
                    <select
                      value={activeCourse.status || "published"}
                      onChange={(e) => updateActiveCourse("status", e.target.value)}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={activeCourse.order || 1}
                      onChange={(e) => updateActiveCourse("order", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================
           4. PARENT CATEGORY MODAL (Create / Edit)
      ====================================================== */}
      {categoryModal.open && (
        <div
          id="categoryModalOverlay"
          className="category-modal-overlay"
          onClick={(e) => {
            if (e.target.id === "categoryModalOverlay") {
              setCategoryModal({ open: false, mode: "create", index: null, data: {} });
            }
          }}
        >
          <div className="category-modal">
            <div className="category-modal-header">
              <div>
                <div className="kicker">Parent Category Card</div>
                <h2>
                  {categoryModal.mode === "create"
                    ? "Add Parent Category"
                    : "Edit Parent Category"}
                </h2>
              </div>

              <button
                type="button"
                className="category-modal-close"
                onClick={() =>
                  setCategoryModal({ open: false, mode: "create", index: null, data: {} })
                }
              >
                ×
              </button>
            </div>

            <div className="category-modal-body">
              <div className="form-grid">
                <div className="field full">
                  <label>Category Title (e.g. Bachelor's Degree Programmes, Ph.D, Distance Education)</label>
                  <input
                    type="text"
                    value={categoryModal.data.title || ""}
                    placeholder="e.g. Bachelor's Degree Programmes"
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Category Code / Tag (e.g. UG, Ph.D, Distance)</label>
                  <input
                    type="text"
                    value={categoryModal.data.code || ""}
                    placeholder="e.g. UG, Ph.D, Distance"
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, code: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Badge Label (Floating on card)</label>
                  <input
                    type="text"
                    value={categoryModal.data.badge || ""}
                    placeholder="e.g. Undergraduate, Doctoral, Online"
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, badge: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={categoryModal.data.subtitle || ""}
                    placeholder="e.g. Undergraduate Degrees"
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, subtitle: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={categoryModal.data.order || 1}
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, order: Number(e.target.value) },
                      }))
                    }
                  />
                </div>

                <div className="field full">
                  <MediaPicker
                    label="Parent Card Cover / Background Image (Optional)"
                    type="image"
                    multiple={false}
                    value={categoryModal.data.image || null}
                    onChange={(media) => {
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, image: media },
                      }));
                    }}
                  />
                </div>

                <div className="field full">
                  <label>Description (Displayed on card and category header)</label>
                  <textarea
                    rows={3}
                    value={categoryModal.data.description || ""}
                    placeholder="Brief overview of programmes available under this parent degree category..."
                    onChange={(e) =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e8e2d8",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setCategoryModal({ open: false, mode: "create", index: null, data: {} })
                  }
                >
                  Cancel
                </button>

                <button type="button" className="btn btn-primary" onClick={saveCategoryModal}>
                  {categoryModal.mode === "create" ? "Add Category" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
           5. SYLLABUS MODAL (#syllabusModal)
      ====================================================== */}
      {syllabusModal.open && syllabusModal.data && (
        <div
          id="syllabusModal"
          className="syllabus-modal-overlay"
          onClick={(e) => {
            if (e.target.id === "syllabusModal") {
              setSyllabusModal({ open: false, yearIdx: null, semIdx: null, subIdx: null, data: null });
            }
          }}
        >
          <div className="syllabus-modal">
            <div className="syllabus-modal-header">
              <div>
                <div className="kicker">Subject</div>
                <h2>{syllabusModal.data.name || "Subject Syllabus"}</h2>
              </div>

              <button
                type="button"
                className="syllabus-modal-close"
                onClick={() =>
                  setSyllabusModal({ open: false, yearIdx: null, semIdx: null, subIdx: null, data: null })
                }
              >
                ×
              </button>
            </div>

            <div className="syllabus-modal-body">
              <div className="form-grid">
                <div className="field">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    value={syllabusModal.data.name || ""}
                    placeholder="e.g. Programming Fundamentals"
                    onChange={(e) =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, name: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Subject Type</label>
                  <select
                    value={syllabusModal.data.type || "Theory + Practical"}
                    onChange={(e) =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, type: e.target.value },
                      }))
                    }
                  >
                    <option value="Theory + Practical">Theory + Practical</option>
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Project">Project / Dissertation</option>
                    <option value="Seminar">Seminar / Internship</option>
                  </select>
                </div>

                <div className="field">
                  <label>Credits</label>
                  <input
                    type="number"
                    value={syllabusModal.data.credits || 4}
                    onChange={(e) =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, credits: Number(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Syllabus Presentation Format Mode Selector */}
              <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#171717",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Syllabus Format
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      border:
                        (syllabusModal.data.syllabusMode ||
                          ((syllabusModal.data.syllabus && syllabusModal.data.syllabus.length > 0)
                            ? "detailed"
                            : syllabusModal.data.syllabusPdf
                            ? "pdf"
                            : "detailed")) === "detailed"
                          ? "2px solid #171717"
                          : "1px solid #ddd6ce",
                      background:
                        (syllabusModal.data.syllabusMode ||
                          ((syllabusModal.data.syllabus && syllabusModal.data.syllabus.length > 0)
                            ? "detailed"
                            : syllabusModal.data.syllabusPdf
                            ? "pdf"
                            : "detailed")) === "detailed"
                          ? "#f4f4f5"
                          : "#fff",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, syllabusMode: "detailed" },
                      }))
                    }
                  >
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#1c1917" }}>
                      📝 Detailed Syllabus Units
                    </div>
                    <div style={{ fontSize: "11px", color: "#78716c", marginTop: "2px" }}>
                      Enter unit topics and descriptions (with optional syllabus PDF)
                    </div>
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      border:
                        (syllabusModal.data.syllabusMode ||
                          ((syllabusModal.data.syllabus && syllabusModal.data.syllabus.length > 0)
                            ? "detailed"
                            : syllabusModal.data.syllabusPdf
                            ? "pdf"
                            : "detailed")) === "pdf"
                          ? "2px solid #171717"
                          : "1px solid #ddd6ce",
                      background:
                        (syllabusModal.data.syllabusMode ||
                          ((syllabusModal.data.syllabus && syllabusModal.data.syllabus.length > 0)
                            ? "detailed"
                            : syllabusModal.data.syllabusPdf
                            ? "pdf"
                            : "detailed")) === "pdf"
                          ? "#f4f4f5"
                          : "#fff",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, syllabusMode: "pdf" },
                      }))
                    }
                  >
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#1c1917" }}>
                      📄 Syllabus PDF Only
                    </div>
                    <div style={{ fontSize: "11px", color: "#78716c", marginTop: "2px" }}>
                      Attach only a Syllabus PDF document for this subject
                    </div>
                  </button>
                </div>
              </div>

              {/* Syllabus PDF Document Picker */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#24211f",
                        display: "block",
                      }}
                    >
                      {syllabusModal.data.syllabusMode === "pdf"
                        ? "📄 Subject Syllabus PDF Document"
                        : "📄 Syllabus PDF Document (Optional)"}
                    </label>
                    <span style={{ fontSize: "12px", color: "#777" }}>
                      {syllabusModal.data.syllabusMode === "pdf"
                        ? "Upload or enter the syllabus PDF URL. Students will see this document when they click this subject."
                        : "Upload or select a PDF document containing the official subject syllabus."}
                    </span>
                  </div>

                  <MediaPicker
                    label="Select PDF"
                    type="document"
                    value={syllabusModal.data.syllabusPdf}
                    onChange={(media) => {
                      const pdfUrl = (typeof media === "object" ? media?.url : media) || "";
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, syllabusPdf: pdfUrl },
                      }));
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={
                      (typeof syllabusModal.data.syllabusPdf === "object"
                        ? syllabusModal.data.syllabusPdf?.url
                        : syllabusModal.data.syllabusPdf) || ""
                    }
                    placeholder="Enter PDF URL or click 'Select PDF' above"
                    onChange={(e) =>
                      setSyllabusModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, syllabusPdf: e.target.value },
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      fontSize: "13px",
                      background: "#fff",
                      border: "1px solid #ddd6ce",
                    }}
                  />

                  {syllabusModal.data.syllabusPdf && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: "8px 12px", fontSize: "12px" }}
                      onClick={() =>
                        setSyllabusModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, syllabusPdf: "" },
                        }))
                      }
                    >
                      Remove PDF
                    </button>
                  )}
                </div>

                {syllabusModal.data.syllabusPdf && (
                  <div style={{ marginTop: "6px" }}>
                    <a
                      href={
                        typeof syllabusModal.data.syllabusPdf === "object"
                          ? syllabusModal.data.syllabusPdf?.url
                          : syllabusModal.data.syllabusPdf
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#171717",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      ↗ View Attached PDF Document
                    </a>
                  </div>
                )}
              </div>

              {/* Units Section or PDF-Only State */}
              {syllabusModal.data.syllabusMode === "pdf" ? (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "20px",
                    background: "#f9fafb",
                    border: "1px dashed #e5e7eb",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>
                    PDF-Only Syllabus Mode Active
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>
                    Students clicking on <strong>{syllabusModal.data.name || "this subject"}</strong> on the course page will directly view and download this syllabus PDF document.
                  </p>
                </div>
              ) : (
                <>
                  <br />

                  <div className="section-heading">
                    <div>
                      <h2 style={{ fontFamily: "Georgia", fontWeight: 500 }}>Syllabus Units</h2>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const units = [...(syllabusModal.data.syllabus || [])];
                        const nextNum = units.length + 1;
                        units.push({
                          unitNumber: String(nextNum).padStart(2, "0"),
                          title: `Unit ${nextNum} — Module Title`,
                          topics: ["Core Topic 1", "Core Topic 2"],
                        });
                        setSyllabusModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, syllabus: units },
                        }));
                      }}
                    >
                      + Add Unit
                    </button>
                  </div>

                  {/* Units List */}
                  {(syllabusModal.data.syllabus || []).map((unit, uIdx) => (
                    <div key={uIdx} className="unit">
                      <div className="unit-header">
                        <strong>
                          Unit {unit.unitNumber || String(uIdx + 1).padStart(2, "0")} — {unit.title}
                        </strong>

                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            const units = syllabusModal.data.syllabus.filter((_, i) => i !== uIdx);
                            setSyllabusModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, syllabus: units },
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="unit-content">
                        <div className="field" style={{ marginBottom: "12px" }}>
                          <label>Unit Title</label>
                          <input
                            type="text"
                            value={unit.title || ""}
                            onChange={(e) => {
                              const units = [...syllabusModal.data.syllabus];
                              units[uIdx].title = e.target.value;
                              setSyllabusModal((prev) => ({
                                ...prev,
                                data: { ...prev.data, syllabus: units },
                              }));
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              color: "#777",
                              fontWeight: 600,
                            }}
                          >
                            Topics
                          </label>
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#171717",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            onClick={() => {
                              const units = [...syllabusModal.data.syllabus];
                              units[uIdx].topics = [...(units[uIdx].topics || []), "New Topic"];
                              setSyllabusModal((prev) => ({
                                ...prev,
                                data: { ...prev.data, syllabus: units },
                              }));
                            }}
                          >
                            + Topic
                          </button>
                        </div>

                        <ul
                          className="topic-list"
                          style={{ listStyle: "none", paddingLeft: 0, marginTop: "8px" }}
                        >
                          {(unit.topics || []).map((tp, tIdx) => (
                            <li
                              key={tIdx}
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                marginBottom: "6px",
                              }}
                            >
                              <span style={{ color: "#999" }}>—</span>
                              <input
                                type="text"
                                value={tp}
                                onChange={(e) => {
                                  const units = [...syllabusModal.data.syllabus];
                                  units[uIdx].topics[tIdx] = e.target.value;
                                  setSyllabusModal((prev) => ({
                                    ...prev,
                                    data: { ...prev.data, syllabus: units },
                                  }));
                                }}
                                style={{
                                  flex: 1,
                                  padding: "6px 10px",
                                  fontSize: "13px",
                                  border: "1px solid #ddd6ce",
                                  background: "#fff",
                                }}
                              />
                              <button
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#a44d45",
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                }}
                                onClick={() => {
                                  const units = [...syllabusModal.data.syllabus];
                                  units[uIdx].topics = units[uIdx].topics.filter((_, i) => i !== tIdx);
                                  setSyllabusModal((prev) => ({
                                    ...prev,
                                    data: { ...prev.data, syllabus: units },
                                  }));
                                }}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setSyllabusModal({
                      open: false,
                      yearIdx: null,
                      semIdx: null,
                      subIdx: null,
                      data: null,
                    })
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const { yearIdx, semIdx, subIdx, data } = syllabusModal;
                    if (!data) return;
                    const mode =
                      data.syllabusMode ||
                      ((data.syllabus && data.syllabus.length > 0)
                        ? "detailed"
                        : data.syllabusPdf
                        ? "pdf"
                        : "detailed");
                    const finalData = {
                      ...data,
                      syllabusMode: mode,
                      syllabus: mode === "pdf" ? [] : (data.syllabus || []),
                    };
                    const cur = [...activeCourse.curriculum];
                    cur[yearIdx].semesters[semIdx].subjects[subIdx] = finalData;
                    updateActiveCourse("curriculum", cur);
                    setSyllabusModal({
                      open: false,
                      yearIdx: null,
                      semIdx: null,
                      subIdx: null,
                      data: null,
                    });
                  }}
                >
                  Save Subject Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
           6. LIVE PREVIEW MODAL
      ====================================================== */}
      {previewModalOpen && (
        <div
          className="courses-preview-modal-overlay"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => {
            if (e.target.className === "courses-preview-modal-overlay")
              setPreviewModalOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#f7f5f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "#24211f",
                color: "#fff",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Live Editorial Preview</div>
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  background: "transparent",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  padding: "6px 14px",
                  fontSize: "12px",
                }}
                onClick={() => setPreviewModalOpen(false)}
              >
                Close Preview
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {currentView === "editor" && activeCourse ? (
                <CoursesTemplate
                  data={{
                    title: activeCourse.courseName,
                    slug: activeCourse.slug,
                    courseData: {
                      general: {
                        courseName: activeCourse.courseName,
                        courseCode: activeCourse.courseCode,
                        level: activeCourse.level,
                        duration: activeCourse.duration,
                        semesters: activeCourse.semesters,
                        eligibility: activeCourse.eligibility,
                        mode: activeCourse.mode,
                        image: activeCourse.image,
                        shortDescription: activeCourse.shortDescription,
                      },
                      overview: activeCourse.overview,
                      highlights: activeCourse.highlights,
                      curriculum: activeCourse.curriculum,
                      curriculumPdf: activeCourse.curriculumPdf,
                    },
                  }}
                  onBack={() => setPreviewModalOpen(false)}
                />
              ) : (
                <CoursesDirectory data={page} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesEditor;
