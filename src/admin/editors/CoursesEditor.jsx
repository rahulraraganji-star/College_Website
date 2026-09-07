import { useState, useEffect } from "react";
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
  // Current view: 'directory' (Directory settings & programme list) OR 'editor' (Editing an individual programme)
  const [currentView, setCurrentView] = useState("directory");

  // Active course being edited in editor view
  const [activeCourseIndex, setActiveCourseIndex] = useState(null);

  // Active Tab inside the individual course editor ('general' | 'overview' | 'highlights' | 'curriculum' | 'settings')
  const [activeEditorTab, setActiveEditorTab] = useState("general");

  // Accordion state for Year cards in curriculum tab
  const [openYears, setOpenYears] = useState({ 0: true });

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

  // Ensure courseData list exists without injecting phantom defaults into existing pages

  // Ensure courseData list exists - strictly 0 default cards
  const courseData = page?.courseData || {};
  const coursesList =
    courseData.courses && Array.isArray(courseData.courses)
      ? courseData.courses
      : [];

  // Sync title and auto-generate slug for page
  const handlePageTitleChange = (e) => {
    const title = e.target.value;
    const autoSlug = slugify(title);
    setPage((prev) => ({
      ...prev,
      title,
      slug: autoSlug,
    }));
  };

  // Helper updater for coursesList in page.courseData.courses
  const updateCoursesList = (newList) => {
    setPage((prev) => ({
      ...prev,
      courseData: {
        ...(prev.courseData || {}),
        courses: newList,
      },
    }));
  };

  // Helper updater for the active course being edited
  const updateActiveCourse = (field, value) => {
    if (activeCourseIndex === null) return;
    const updated = [...coursesList];
    const current = { ...updated[activeCourseIndex], [field]: value };

    // Auto sync slug whenever courseName changes
    if (field === "courseName") {
      current.slug = slugify(value);
    }

    updated[activeCourseIndex] = current;
    updateCoursesList(updated);
  };

  // Open Course Editor
  const openCourse = (idx) => {
    setActiveCourseIndex(idx);
    setActiveEditorTab("general");
    setCurrentView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close Course Editor and return to Directory
  const closeCourse = () => {
    setCurrentView("directory");
    setActiveCourseIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add new course programme - starts blank with zero prefilled data
  const addNewProgramme = () => {
    const newProg = {
      id: `prog-${Date.now()}`,
      courseName: "",
      courseCode: "",
      slug: "",
      level: "Undergraduate",
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
    };

    const updated = [...coursesList, newProg];
    updateCoursesList(updated);
    openCourse(updated.length - 1);
  };

  // Delete course
  const deleteCourse = (idx, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this programme?")) {
      const updated = coursesList.filter((_, i) => i !== idx);
      updateCoursesList(updated);
      if (activeCourseIndex === idx) {
        closeCourse();
      }
    }
  };

  // Strict validation before saving: ensure inner data is written for every programme
  const validateAndSave = () => {
    for (let i = 0; i < coursesList.length; i++) {
      const prog = coursesList[i];
      const progName = prog.courseName?.trim() || `Programme #${i + 1}`;

      // 1. Check Course Name
      if (!prog.courseName || !prog.courseName.trim()) {
        alert(`Please enter a Course Name for Programme #${i + 1}.`);
        openCourse(i);
        setActiveEditorTab("general");
        return;
      }

      // 2. Check Short Description
      if (!prog.shortDescription || !prog.shortDescription.trim()) {
        alert(`Please write a Short Description for "${progName}".`);
        openCourse(i);
        setActiveEditorTab("general");
        return;
      }

      // 3. Check Inner Overview Description
      const hasOverview = Boolean(
        prog.overview?.description?.trim() ||
        prog.overview?.learningOutcomes?.trim()
      );
      if (!hasOverview) {
        alert(`Please write inner data (Programme Overview Description) for "${progName}".`);
        openCourse(i);
        setActiveEditorTab("overview");
        return;
      }

      // 4. Check Inner Curriculum Data
      const hasCurriculum =
        Array.isArray(prog.curriculum) &&
        prog.curriculum.length > 0 &&
        prog.curriculum.some((year) =>
          Array.isArray(year.semesters) &&
          year.semesters.some(
            (sem) => Array.isArray(sem.subjects) && sem.subjects.length > 0
          )
        );

      if (!hasCurriculum) {
        alert(
          `Please write inner curriculum data (at least 1 Year and Subject) for "${progName}".`
        );
        openCourse(i);
        setActiveEditorTab("curriculum");
        return;
      }
    }

    // Validation passed -> trigger save
    onSave?.();
  };

  const activeCourse = activeCourseIndex !== null ? coursesList[activeCourseIndex] : null;

  return (
    <div className="courses-admin-scope">
      {/* =====================================================
           1. DIRECTORY PAGE VIEW (#directory)
      ====================================================== */}
      {currentView === "directory" && (
        <section id="directory" className="directory">
          {/* Top Page Header */}
          <div className="page-header">
            <div>
              <div className="kicker">Course Management</div>
              <h1>{page?.title || "Courses"}</h1>
              <p>Manage the course directory and individual programmes.</p>
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
                <h3>Course Directory</h3>
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
                    value={page?.kicker || "Academic Programmes"}
                    onChange={(e) => setPage((prev) => ({ ...prev, kicker: e.target.value }))}
                    placeholder="Academic Programmes"
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
                      "Explore our academic programmes designed to provide students with strong foundations, practical knowledge and opportunities for professional growth."
                    }
                    onChange={(e) => setPage((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Programmes List Section */}
          <div className="section-heading">
            <div>
              <h2>Programmes</h2>
              <span>
                {coursesList.length} {coursesList.length === 1 ? "programme" : "programmes"}
              </span>
            </div>

            <button type="button" className="btn btn-gold" onClick={addNewProgramme}>
              + Add Programme
            </button>
          </div>

          <div className="course-list">
            {coursesList.length === 0 ? (
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
                  No academic programmes have been created yet.
                </p>
                <button type="button" className="btn btn-gold" onClick={addNewProgramme}>
                  + Add Programme
                </button>
              </div>
            ) : (
              coursesList.map((course, idx) => (
                <div key={course.id || idx} className="course-row">
                  <div
                    className="course-image"
                    style={{
                      backgroundImage: (typeof course.image === "object" ? course.image?.url : course.image)
                        ? `url(${typeof course.image === "object" ? course.image?.url : course.image})`
                        : "none",
                      backgroundColor: "#f0ede6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8a6b3f",
                      fontWeight: 700,
                      fontSize: "14px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!(typeof course.image === "object" ? course.image?.url : course.image) && (
                      <span>{course.courseCode || String(idx + 1).padStart(2, "0")}</span>
                    )}
                  </div>

                  <div className="course-info">
                    <h3>{course.courseName || "Untitled Programme"}</h3>
                    <div className="course-code">{course.courseCode || "CODE"}</div>
                    <div className="course-meta">
                      <span>{course.duration || "3 Years"}</span>
                      <span>{course.semesters ? `${course.semesters} Semesters` : "6 Semesters"}</span>
                      <span>{course.level || "Undergraduate"}</span>
                    </div>
                  </div>

                  <div className="course-actions">
                    <span className={`status ${course.status === "draft" ? "draft" : ""}`}>
                      {course.status === "draft" ? "Draft" : "Published"}
                    </span>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openCourse(idx)}
                    >
                      Edit Course
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={(e) => deleteCourse(idx, e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =====================================================
           2. INDIVIDUAL COURSE EDITOR VIEW (#editor)
      ====================================================== */}
      {currentView === "editor" && activeCourse && (
        <section id="editor" className="editor active">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="editor-course">
              <button type="button" className="back-btn" onClick={closeCourse} title="Back to Courses">
                ←
              </button>

              <div>
                <h2>{activeCourse.courseName || "Programme Name"}</h2>
                <p>
                  {activeCourse.courseCode || "CODE"} · /{page?.slug || "courses"}/
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
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
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
                    <p className="panel-description">These appear as key statistic and feature highlight cards on the course page.</p>
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

                <div className="highlights-editor-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(!activeCourse.highlights || activeCourse.highlights.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "35px 20px", background: "#faf8f5", border: "1px dashed var(--border)", borderRadius: "4px", color: "#888" }}>
                      <p style={{ fontSize: "14px", marginBottom: "12px" }}>No highlights added yet.</p>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#8a6b3f", letterSpacing: "0.08em" }}>
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
                    <p className="panel-description">Manage years, semesters, subjects and syllabi.</p>
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

                {(activeCourse.curriculum || []).map((year, yIdx) => {
                  const isOpen = Boolean(openYears[yIdx]);

                  return (
                    <div key={year.id || yIdx} className={`year ${isOpen ? "open" : ""}`}>
                      <div
                        className="year-header"
                        onClick={() => setOpenYears((prev) => ({ ...prev, [yIdx]: !prev[yIdx] }))}
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

                        <span className="year-toggle-icon">{isOpen ? "−" : "+"}</span>
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
                                  {subjects.map((sub, subIdx) => (
                                    <div key={sub.id || subIdx} className="subject">
                                      <div className="subject-name">{sub.name}</div>
                                      <div className="subject-type">{sub.type || "Theory"}</div>
                                      <div className="subject-credit">{sub.credits || 4} Credits</div>

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
                                            ].semesters[sIdx].subjects.filter((_, i) => i !== subIdx);
                                            updateActiveCourse("curriculum", cur);
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
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
           3. SYLLABUS MODAL (#syllabusModal)
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

              {/* Syllabus PDF Document Picker */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  background: "#faf8f5",
                  border: "1px solid #e8e2d8",
                  borderRadius: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "13px", color: "#24211f", display: "block" }}>
                      📄 Syllabus PDF Document (Optional)
                    </label>
                    <span style={{ fontSize: "12px", color: "#777" }}>
                      Upload or select a PDF document containing the official subject syllabus.
                    </span>
                  </div>

                  <MediaPicker
                    label="Select PDF"
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
                    style={{ flex: 1, padding: "8px 12px", fontSize: "13px", background: "#fff", border: "1px solid #ddd6ce" }}
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
                      style={{ fontSize: "12px", color: "#8a6b3f", fontWeight: 600, textDecoration: "underline" }}
                    >
                      ↗ View Attached PDF Document
                    </a>
                  </div>
                )}
              </div>

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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#777", fontWeight: 600 }}>
                        Topics
                      </label>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "#8a6b3f", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => {
                          const units = [...syllabusModal.data.syllabus];
                          units[uIdx].topics = [...(units[uIdx].topics || []), "New Topic"];
                          setSyllabusModal((prev) => ({
                            ...prev,
                            data: { ...prev.data, syllabus: units },
                          }));
                        }}
                      >
                        + Add Topic
                      </button>
                    </div>

                    <ul className="topic-list" style={{ listStyle: "none", paddingLeft: 0, marginTop: "8px" }}>
                      {(unit.topics || []).map((tp, tIdx) => (
                        <li key={tIdx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
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
                            style={{ flex: 1, padding: "6px 10px", fontSize: "13px", border: "1px solid #ddd6ce", background: "#fff" }}
                          />
                          <button
                            type="button"
                            style={{ background: "none", border: "none", color: "#a44d45", cursor: "pointer", padding: "4px 8px" }}
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setSyllabusModal({ open: false, yearIdx: null, semIdx: null, subIdx: null, data: null })
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
                    const cur = [...activeCourse.curriculum];
                    cur[yearIdx].semesters[semIdx].subjects[subIdx] = data;
                    updateActiveCourse("curriculum", cur);
                    setSyllabusModal({ open: false, yearIdx: null, semIdx: null, subIdx: null, data: null });
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
           4. LIVE PREVIEW MODAL
      ====================================================== */}
      {previewModalOpen && (
        <div
          className="courses-preview-modal-overlay"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => {
            if (e.target.className === "courses-preview-modal-overlay") setPreviewModalOpen(false);
          }}
        >
          <div style={{ width: "100%", height: "100%", background: "#f7f5f0", display: "flex", flexDirection: "column" }}>
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
                style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)", padding: "6px 14px", fontSize: "12px" }}
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
