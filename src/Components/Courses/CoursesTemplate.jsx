import { useState } from "react";
import "./courses.css";

const CoursesTemplate = ({ data, onBack }) => {
  const course = data?.courseData || {};
  const general = course.general || {};
  const overview = course.overview || {};
  const highlights = course.highlights || [];
  const curriculum = course.curriculum || [];

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

  // Values from dynamic data
  const courseTitle = general.courseName || data?.title || "Academic Programme";
  const courseCode = general.courseCode || "";
  const courseLevel = general.level || "Undergraduate";
  const courseDuration = general.duration || "3 Years";
  const courseSemesters = general.semesters || "6";
  const courseEligibility = general.eligibility || "12th Pass";
  const courseSubtitle =
    general.shortDescription ||
    overview.description ||
    "";

  const overviewNarrative =
    overview.description ||
    "";

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
                <div className="section-number">01 — Overview</div>
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
                <div className="section-number">02 — Highlights</div>
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
          {curriculum && curriculum.length > 0 && (
            <section className="section">
              <div className="section-heading">
                <div className="section-number">
                  {highlights && highlights.length > 0 ? "03 — Curriculum" : "02 — Curriculum"}
                </div>
                <h2 className="section-title">Course structure</h2>
              </div>

              {curriculum.map((year, yIdx) => {
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

                                        <div className="credits">{sub.credits || 4}</div>
                                      </div>

                                      {/* Syllabus Accordion Wrapper */}
                                      <div className="syllabus-wrapper">
                                        <div className="syllabus-inner">
                                          <div className="syllabus">
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

                                              {pdfUrl && (
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
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoursesTemplate;
