import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./courses.css";

const CoursesTemplate = ({ data, onBack }) => {
  const course = data?.courseData || {};
  const general = course.general || {};
  const overview = course.overview || {};
  const highlights = course.highlights || [];
  const curriculum = course.curriculum || [];

  // Extract Curriculum PDF (supporting all potential storage locations)
  const rawCurriculumPdf =
    course.curriculumPdf ||
    general.curriculumPdf ||
    course.syllabusPdf ||
    general.syllabusPdf ||
    data?.curriculumPdf ||
    "";
  const curriculumPdf =
    (typeof rawCurriculumPdf === "object" ? rawCurriculumPdf?.url : rawCurriculumPdf) || "";
  const hasPdf = Boolean(
    curriculumPdf && typeof curriculumPdf === "string" && curriculumPdf.trim().length > 0
  );

  // Filter out any years that don't have at least one subject
  const validYears = (curriculum || []).filter(
    (year) =>
      Array.isArray(year.semesters) &&
      year.semesters.some(
        (sem) => Array.isArray(sem.subjects) && sem.subjects.length > 0
      )
  );
  const hasCurriculumDetails = validYears.length > 0;
  const showCurriculumSection = hasCurriculumDetails || hasPdf;

  // State to track which Year accordion is open (default Year 1 is open)
  const [openYears, setOpenYears] = useState({ 0: true });

  // State to track which Subject card is open
  const [openSubjects, setOpenSubjects] = useState({});

  const toggleYear = (yIdx) => {
    setOpenYears((prev) => ({
      ...prev,
      [yIdx]: !prev[yIdx],
    }));
  };

  const toggleSubject = (subKey, e) => {
    if (e) e.stopPropagation();
    setOpenSubjects((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }));
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Values from dynamic data (supporting top-level & general-nested structures)
  const courseCode = general.courseCode || course.courseCode || course.code || "";
  const courseTitle = general.courseName || course.courseName || data?.title || "Academic Programme";
  const courseSlug = general.slug || course.slug || data?.slug || "";
  const departmentName = general.department || course.department || "";
  const courseLevel = general.level || course.level || "Undergraduate";
  const courseDuration = general.duration || course.duration || "3 Years";
  const courseSemesters = general.semesters || course.semesters || "6";
  const courseEligibility = general.eligibility || course.eligibility || "12th Pass";
  const courseSubtitle =
    general.shortDescription ||
    course.shortDescription ||
    overview.description ||
    "";

  const overviewNarrative =
    overview.description ||
    "";

  // Dynamic Faculty CTA calculations based on course / department
  const getFacultyButtonInfo = () => {
    const normSlug = (courseSlug || "").toLowerCase();
    const normCode = (courseCode || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. BCA
    if (normSlug === "bca" || normCode === "bca") {
      return {
        label: "See BCA Faculty",
        deptKey: "bca",
        deptSlug: "bachelor-of-computer-applications-bca",
        deptName: "Bachelor of Computer Applications (BCA)",
      };
    }

    // 2. B.Com / Commerce
    if (
      normSlug === "bcom" ||
      normCode === "bcom" ||
      normSlug === "commerce" ||
      normCode === "commerce"
    ) {
      return {
        label: "See Commerce Faculty",
        deptKey: "commerce",
        deptSlug: "commerce",
        deptName: "Commerce",
      };
    }

    // 3. B.A. / Arts / Humanities
    if (normSlug === "ba" || normCode === "ba") {
      return {
        label: "See Arts & Humanities Faculty",
        deptKey: "ba",
        deptSlug: "humanities",
        deptName: "Humanities & Social Sciences",
      };
    }

    // 4. Custom department
    if (departmentName) {
      const cleanDept = departmentName.replace(/^Department of\s+/i, "");
      return {
        label: `See ${cleanDept} Faculty`,
        deptKey: cleanDept.toLowerCase(),
        deptSlug: cleanDept.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        deptName: cleanDept,
      };
    }

    // 5. Course Code fallback
    if (courseCode) {
      return {
        label: `See ${courseCode} Faculty`,
        deptKey: courseCode.toLowerCase(),
        deptSlug: courseCode.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        deptName: courseCode,
      };
    }

    // 6. Course Title fallback
    if (courseTitle && courseTitle !== "Academic Programme") {
      return {
        label: `See ${courseTitle} Faculty`,
        deptKey: (courseSlug || courseTitle).toLowerCase(),
        deptSlug: (courseSlug || courseTitle).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        deptName: courseTitle,
      };
    }

    return {
      label: "See Faculty",
      deptKey: "faculty",
      deptSlug: "faculty",
      deptName: "Teaching Faculty",
    };
  };

  const facultyInfo = getFacultyButtonInfo();

  const handleSeeFaculty = (e) => {
    if (e) e.preventDefault();
    if (location.pathname.startsWith("/admin")) {
      alert(`In live site, this will redirect to Staff page auto-scrolled to ${facultyInfo.deptName}.`);
      return;
    }
    navigate(`/staff/faculty-profiles?dept=${encodeURIComponent(facultyInfo.deptKey)}#${facultyInfo.deptSlug}`);
  };

  const renderFacultyButton = () => (
    <div className="course-faculty-btn-wrapper">
      <button
        type="button"
        className="course-faculty-btn"
        onClick={handleSeeFaculty}
        id="btn-see-faculty"
      >
        <span>{facultyInfo.label}</span>
        <span className="course-faculty-btn-arrow">→</span>
      </button>
    </div>
  );

  // Dynamic section numbering
  let sectionIndex = 1;
  const overviewNum = overviewNarrative ? String(sectionIndex++).padStart(2, "0") : null;
  const highlightsNum = highlights && highlights.length > 0 ? String(sectionIndex++).padStart(2, "0") : null;
  const curriculumNum = String(sectionIndex++).padStart(2, "0");

  return (
    <div className="courses-scope">
      <main id="courseDetail" className="course-detail active">
        <div className="container">
          {/* Back Button */}
          {onBack && (
            <button className="back-button" onClick={onBack}>
              ← Back to Courses
            </button>
          )}

          {/* =====================================================
              HERO (Matching HTML Template)
          ====================================================== */}
          <section className="detail-hero">
            <div>
              <div className="eyebrow">
                {courseLevel ? `${courseLevel} Programme` : "Undergraduate Programme"}
              </div>

              <h1 className="detail-title">{courseTitle}</h1>

              <p className="detail-subtitle">{courseSubtitle}</p>
            </div>

            <div className="detail-meta">
              <div className="detail-meta-item">
                <span className="label">Programme</span>
                <span className="value">{courseCode}</span>
              </div>

              <div className="detail-meta-item">
                <span className="label">Duration</span>
                <span className="value">{courseDuration}</span>
              </div>

              <div className="detail-meta-item">
                <span className="label">Semesters</span>
                <span className="value">{courseSemesters}</span>
              </div>

              <div className="detail-meta-item">
                <span className="label">Eligibility</span>
                <span className="value">{courseEligibility}</span>
              </div>
            </div>
          </section>

          {/* =====================================================
              OVERVIEW
          ====================================================== */}
          {overviewNarrative && (
            <section className="section">
              <div className="section-heading">
                <div className="section-number">{overviewNum} — Overview</div>
                <h2 className="section-title">About the programme</h2>
              </div>

              <p className="overview-text">{overviewNarrative}</p>
            </section>
          )}

          {/* =====================================================
              HIGHLIGHTS
          ====================================================== */}
          {highlights && highlights.length > 0 && (
            <section className="section">
              <div className="section-heading">
                <div className="section-number">{highlightsNum} — Highlights</div>
                <h2 className="section-title">Programme highlights</h2>
              </div>

              <div className="highlight-grid">
                {highlights.map((hl, idx) => (
                  <div key={idx} className="highlight-card">
                    <div className="highlight-number">
                      {hl.number || hl.title?.split(" ")[0] || String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="highlight-title">{hl.title}</div>
                      <p className="highlight-description">{hl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =====================================================
              COURSE STRUCTURE (ACCORDIONS)
          ====================================================== */}
          {showCurriculumSection && (
            <section className="section">
              <div className="section-heading">
                <div className="section-number">
                  {curriculumNum} — Curriculum
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h2 className="section-title" style={{ margin: 0 }}>
                      Course structure
                    </h2>
                    {!hasCurriculumDetails && (
                      <p className="overview-text" style={{ marginTop: "16px" }}>
                        The comprehensive curriculum modules, syllabus breakdown, and academic structure for this programme are available in the official curriculum document.
                      </p>
                    )}
                  </div>

                  {hasPdf && hasCurriculumDetails && (
                    <a
                      href={curriculumPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--dark)",
                        color: "#ffffff",
                        padding: "10px 20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        transition: "background 0.3s ease",
                        marginBottom: "4px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--dark)")}
                    >
                      <span>Download Curriculum (PDF)</span>
                      <span style={{ fontSize: "14px" }}>↓</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Option A: Only PDF provided (no detailed modules) */}
              {!hasCurriculumDetails && hasPdf && (
                <>
                  <div
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      padding: "36px 40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "24px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "var(--soft)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          flexShrink: 0,
                        }}
                      >
                        📄
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "24px",
                            fontWeight: 400,
                            margin: "0 0 6px 0",
                            letterSpacing: "-0.02em",
                            color: "var(--dark)",
                          }}
                        >
                          Curriculum & Syllabus Document
                        </h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
                          Official academic curriculum structure, subject breakdown, and credit scheme (PDF)
                        </p>
                      </div>
                    </div>

                    <a
                      href={curriculumPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "var(--dark)",
                        color: "#ffffff",
                        padding: "14px 28px",
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--dark)")}
                    >
                      <span>Download Curriculum PDF</span>
                      <span style={{ fontSize: "16px" }}>↓</span>
                    </a>
                  </div>

                  {renderFacultyButton()}
                </>
              )}

              {/* Option B: Detailed Modules Accordions */}
              {hasCurriculumDetails &&
                validYears.map((year, yIdx) => {
                  const isOpen = Boolean(openYears[yIdx]);
                  const formattedYearNum = year.yearNumber || String(yIdx + 1).padStart(2, "0");

                  return (
                    <div key={year.id || yIdx} className={`year-card ${isOpen ? "open" : ""}`}>
                      {/* Year Header (clickable) */}
                      <div className="year-header" onClick={() => toggleYear(yIdx)}>
                        <div className="year-number">{formattedYearNum}</div>

                        <div className="year-info">
                          <h3>{year.yearName || `Year ${yIdx + 1}`}</h3>
                          <p>{year.subtitle || "Foundation & Core Concepts"}</p>
                        </div>

                        <div className="year-arrow">+</div>
                      </div>

                      {/* Year Content (Expandable) */}
                      <div className="year-content">
                        <div className="year-content-inner">
                          {(year.semesters || []).map((sem, sIdx) => {
                            const subjects = sem.subjects || [];

                            return (
                              <div key={sem.id || sIdx} className="semester">
                                <div className="semester-header">
                                  <div className="semester-title">
                                    {sem.semesterName || `Semester ${sIdx + 1}`}
                                  </div>
                                  <div className="semester-count">{subjects.length} Subjects</div>
                                </div>

                                <div className="subjects">
                                  {subjects.map((sub, subIdx) => {
                                    const subKey = `${yIdx}-${sIdx}-${subIdx}`;
                                    const isSubOpen = Boolean(openSubjects[subKey]);
                                    const syllabusList = sub.syllabus || [];
                                    const pdfUrl =
                                      (typeof sub.syllabusPdf === "object"
                                        ? sub.syllabusPdf?.url
                                        : sub.syllabusPdf) || "";
                                    const hasSubPdf = Boolean(
                                      pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim().length > 0
                                    );
                                    const hasSubUnits =
                                      Array.isArray(syllabusList) && syllabusList.length > 0;

                                    return (
                                      <div
                                        key={sub.id || subIdx}
                                        className={`subject-card ${isSubOpen ? "open" : ""}`}
                                        onClick={(e) => toggleSubject(subKey, e)}
                                      >
                                        {/* Subject Header */}
                                        <div className="subject-header">
                                          <div>
                                            <div className="subject-name">
                                              {sub.name || "Subject Title"}
                                            </div>
                                            <div className="subject-type">
                                              {sub.type || "Theory + Practical"}
                                            </div>
                                          </div>

                                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            {hasSubPdf && !hasSubUnits && (
                                              <span
                                                style={{
                                                  fontSize: "11px",
                                                  fontWeight: 600,
                                                  background: "var(--soft)",
                                                  color: "var(--dark)",
                                                  padding: "3px 8px",
                                                  border: "1px solid var(--border)",
                                                  letterSpacing: "0.04em",
                                                  textTransform: "uppercase",
                                                }}
                                              >
                                                Syllabus PDF
                                              </span>
                                            )}
                                            <div className="credits">{sub.credits || 4}</div>
                                          </div>
                                        </div>

                                        {/* Syllabus Accordion Wrapper */}
                                        <div className="syllabus-wrapper">
                                          <div className="syllabus-inner">
                                            <div className="syllabus">
                                              {hasSubPdf && !hasSubUnits ? (
                                                /* Option: User provided ONLY a PDF for this subject */
                                                <div
                                                  style={{
                                                    background: "#faf8f5",
                                                    border: "1px solid var(--border)",
                                                    padding: "20px 24px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    flexWrap: "wrap",
                                                    gap: "16px",
                                                    marginTop: "4px",
                                                    marginBottom: "6px",
                                                  }}
                                                >
                                                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div
                                                      style={{
                                                        width: "42px",
                                                        height: "42px",
                                                        background: "var(--soft)",
                                                        border: "1px solid var(--border)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "20px",
                                                        color: "var(--dark)",
                                                        flexShrink: 0,
                                                      }}
                                                    >
                                                      📄
                                                    </div>
                                                    <div>
                                                      <div
                                                        style={{
                                                          fontFamily: "'Playfair Display', serif",
                                                          fontSize: "17px",
                                                          fontWeight: 600,
                                                          color: "var(--dark)",
                                                          margin: "0 0 2px 0",
                                                        }}
                                                      >
                                                        {sub.name} — Syllabus Document
                                                      </div>
                                                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                                                        Official curriculum syllabus outline (PDF)
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <a
                                                    href={pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      gap: "8px",
                                                      background: "var(--dark)",
                                                      color: "#ffffff",
                                                      padding: "10px 18px",
                                                      fontSize: "12px",
                                                      fontWeight: 600,
                                                      letterSpacing: "0.05em",
                                                      textTransform: "uppercase",
                                                      textDecoration: "none",
                                                      transition: "background 0.3s ease",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                      (e.currentTarget.style.background = "#333")
                                                    }
                                                    onMouseLeave={(e) =>
                                                      (e.currentTarget.style.background = "var(--dark)")
                                                    }
                                                  >
                                                    <span>Download / View PDF</span>
                                                    <span style={{ fontSize: "14px" }}>↓</span>
                                                  </a>
                                                </div>
                                              ) : (
                                                /* Option: User provided detailed syllabus units (with or without PDF) */
                                                <>
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      justifyContent: "space-between",
                                                      alignItems: "center",
                                                      flexWrap: "wrap",
                                                      gap: "12px",
                                                      marginBottom: "24px",
                                                    }}
                                                  >
                                                    <div className="syllabus-label" style={{ margin: 0 }}>
                                                      Syllabus Units
                                                    </div>

                                                    {hasSubPdf && (
                                                      <a
                                                        href={pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                          display: "inline-flex",
                                                          alignItems: "center",
                                                          gap: "6px",
                                                          fontSize: "12px",
                                                          fontWeight: "600",
                                                          color: "#171717",
                                                          background: "#f0ede6",
                                                          padding: "5px 10px",
                                                          borderRadius: "4px",
                                                          textDecoration: "none",
                                                          border: "1px solid var(--border)",
                                                        }}
                                                      >
                                                        📄 Download Syllabus (PDF)
                                                      </a>
                                                    )}
                                                  </div>

                                                  {syllabusList.length === 0 ? (
                                                    <p
                                                      style={{
                                                        fontSize: "13px",
                                                        color: "var(--muted)",
                                                        fontStyle: "italic",
                                                      }}
                                                    >
                                                      Detailed syllabus modules will be published soon.
                                                    </p>
                                                  ) : (
                                                    syllabusList.map((unit, uIdx) => (
                                                      <div key={uIdx} className="unit">
                                                        <div className="unit-number">
                                                          {unit.unitNumber ||
                                                            String(uIdx + 1).padStart(2, "0")}
                                                        </div>

                                                        <div>
                                                          <div className="unit-title">{unit.title}</div>

                                                          {unit.topics && unit.topics.length > 0 && (
                                                            <ul className="topics">
                                                              {unit.topics.map((top, tIdx) => (
                                                                <li key={tIdx}>{top}</li>
                                                              ))}
                                                            </ul>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* SEE FACULTY BUTTON (BELOW THIRD YEAR OR WHICHEVER YEAR THIS COURSE HAS) */}
              {renderFacultyButton()}
            </section>
          )}

          {/* FALLBACK FACULTY SECTION (IF NO CURRICULUM MODULES OR PDF EXIST) */}
          {!showCurriculumSection && (
            <section className="section">
              <div className="section-heading">
                <div className="section-number">{curriculumNum} — Faculty</div>
                <h2 className="section-title">Academic Faculty</h2>
              </div>
              {renderFacultyButton()}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoursesTemplate;
