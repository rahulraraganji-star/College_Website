import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CoursesTemplate from "./CoursesTemplate";
import "./courses.css";

const slugify = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const CoursesDirectory = ({ data }) => {
  const [internalData, setInternalData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const effectiveData = data || internalData;

  // If no data prop, fetch /api/pages/courses fallback
  useEffect(() => {
    if (data) return;

    fetch("/api/pages/courses")
      .then((res) => {
        if (res.ok) return res.json();
        return fetch("/api/pages/programmes").then((r) => (r.ok ? r.json() : null));
      })
      .then((d) => {
        if (d) setInternalData(d);
      })
      .catch(() => {});
  }, [data]);

  // Normalize data to guarantee categories hierarchy while supporting legacy flat courses
  const categories = useMemo(() => {
    const courseData = effectiveData?.courseData || {};

    // 1. Structured categories with inner courses
    if (Array.isArray(courseData.categories) && courseData.categories.length > 0) {
      return courseData.categories.map((cat, catIdx) => {
        const catCourses = Array.isArray(cat.courses)
          ? cat.courses.filter((c) => c && c.status !== "draft")
          : [];

        const catTitle = cat.title || `Academic Category ${catIdx + 1}`;
        const catSlug = cat.slug || slugify(catTitle);

        return {
          id: cat.id || `cat-${catIdx}`,
          title: catTitle,
          code: cat.code || cat.badge || "",
          slug: catSlug,
          subtitle: cat.subtitle || "",
          badge: cat.badge || cat.code || "Academic",
          description: cat.description || "",
          image: cat.image || "",
          order: cat.order ?? catIdx + 1,
          courses: catCourses,
        };
      });
    }

    // 2. Legacy flat courses: normalize into a default category
    if (Array.isArray(courseData.courses) && courseData.courses.length > 0) {
      const publishedCourses = courseData.courses.filter((c) => c && c.status !== "draft");

      const defaultCategory = {
        id: "cat-all-programmes",
        title: "Degree & Academic Programmes",
        code: "Degree",
        slug: "programmes",
        subtitle: "Comprehensive Academic Disciplines",
        badge: "Degree",
        description:
          "Explore our comprehensive academic degree programmes designed to provide strong theoretical foundations and practical career competencies.",
        image: "",
        order: 1,
        courses: publishedCourses,
      };

      return [defaultCategory];
    }

    return [];
  }, [effectiveData]);

  // Derive active category & active course detail directly from URL query params (?category=...&course=...)
  const { activeCategory, activeCourseDetail } = useMemo(() => {
    if (categories.length === 0) return { activeCategory: null, activeCourseDetail: null };

    const catParam = searchParams.get("category");
    const courseParam = searchParams.get("course");

    // Only match non-empty courseParam
    if (courseParam && courseParam.trim() !== "") {
      const normalizedCourse = courseParam.trim().toLowerCase();
      let matchedCourse = null;
      let matchedCategory = null;

      for (const cat of categories) {
        const found = (cat.courses || []).find(
          (c) =>
            (c.slug && c.slug.toLowerCase() === normalizedCourse) ||
            (c.courseCode && c.courseCode.trim().toLowerCase() === normalizedCourse) ||
            (c.id && String(c.id).toLowerCase() === normalizedCourse) ||
            (c.courseName && slugify(c.courseName) === normalizedCourse)
        );
        if (found) {
          matchedCourse = found;
          matchedCategory = cat;
          break;
        }
      }

      if (matchedCourse) {
        return { activeCategory: matchedCategory, activeCourseDetail: matchedCourse };
      }
    }

    // Only match non-empty catParam
    if (catParam && catParam.trim() !== "") {
      const normalizedCat = catParam.trim().toLowerCase();
      const foundCat = categories.find(
        (cat) =>
          (cat.slug && cat.slug.toLowerCase() === normalizedCat) ||
          (cat.code && cat.code.trim().toLowerCase() === normalizedCat) ||
          (cat.id && String(cat.id).toLowerCase() === normalizedCat) ||
          (cat.title && slugify(cat.title) === normalizedCat)
      );
      if (foundCat) {
        return { activeCategory: foundCat, activeCourseDetail: null };
      }
    }

    // No active query params -> Show Level 1 (All Parent Cards)
    return { activeCategory: null, activeCourseDetail: null };
  }, [categories, searchParams]);

  // Navigate to Level 2: Inner Courses for a Category
  const handleOpenCategory = (cat) => {
    const catParamVal = cat.slug || slugify(cat.title) || cat.id;
    if (catParamVal) {
      setSearchParams({ category: catParamVal });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back to Level 1: Parent Categories List
  const handleBackToCategories = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate to Level 3: Individual Course Detail
  const handleOpenCourse = (courseItem, cat) => {
    const categoryToUse = cat || activeCategory;
    const newParams = {};
    if (categoryToUse?.slug || categoryToUse?.title) {
      newParams.category = categoryToUse.slug || slugify(categoryToUse.title);
    }
    const courseParamVal = courseItem.slug || courseItem.courseCode?.toLowerCase() || courseItem.id;
    if (courseParamVal) {
      newParams.course = courseParamVal;
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back from Level 3: Return to Level 2 (Inner Category) or Level 1
  const handleBackFromCourseDetail = () => {
    if (activeCategory) {
      const catParamVal = activeCategory.slug || slugify(activeCategory.title) || activeCategory.id;
      if (catParamVal) {
        setSearchParams({ category: catParamVal });
      } else {
        setSearchParams({});
      }
    } else {
      setSearchParams({});
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================================================
  // VIEW 3: COURSE DETAIL VIEW (CoursesTemplate)
  // =========================================================================
  if (activeCourseDetail) {
    const courseDataObj = {
      title: activeCourseDetail.courseName || activeCourseDetail.title,
      slug: activeCourseDetail.slug,
      parentSlug: activeCourseDetail.parentSlug || internalData?.parentSlug || "academics",
      courseData: {
        general: {
          courseName: activeCourseDetail.courseName || activeCourseDetail.title,
          courseCode: activeCourseDetail.courseCode,
          slug: activeCourseDetail.slug,
          level: activeCourseDetail.level || activeCategory?.badge || "Undergraduate",
          duration: activeCourseDetail.duration || "3 Years",
          semesters: activeCourseDetail.semesters || "6",
          eligibility: activeCourseDetail.eligibility || "12th Pass",
          mode: activeCourseDetail.mode || "Full Time",
          image: activeCourseDetail.image,
          curriculumPdf: activeCourseDetail.curriculumPdf || activeCourseDetail.syllabusPdf || "",
          shortDescription:
            activeCourseDetail.shortDescription ||
            activeCourseDetail.description ||
            activeCourseDetail.overview?.description,
        },
        overview: activeCourseDetail.overview || {
          description: activeCourseDetail.shortDescription || "",
        },
        highlights: activeCourseDetail.highlights || [],
        curriculum: activeCourseDetail.curriculum || [],
        curriculumPdf: activeCourseDetail.curriculumPdf || activeCourseDetail.syllabusPdf || "",
        admission: activeCourseDetail.admission || {},
      },
    };

    return (
      <div key={activeCourseDetail.slug || activeCourseDetail.courseCode || "course-detail"} className="page-transition">
        <CoursesTemplate data={courseDataObj} onBack={handleBackFromCourseDetail} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: INNER COURSES VIEW (For Selected Parent Category Card)
  // =========================================================================
  if (activeCategory) {
    const innerCourses = activeCategory.courses || [];

    return (
      <div key={`category-${activeCategory.id || activeCategory.slug}`} className="courses-scope page-transition">
        <main id="categoryCoursesPage">
          {/* Category Banner & Breadcrumb */}
          <section className="container">
            <div className="category-inner-header">
              <button
                type="button"
                className="category-back-btn"
                onClick={handleBackToCategories}
              >
                ← Back to Degree Programmes
              </button>

              <div className="eyebrow">
                {activeCategory.badge ? `${activeCategory.badge} Programmes` : "Academic Category"}
              </div>

              <div className="category-inner-title-row">
                <div>
                  <h1 className="category-inner-title">{activeCategory.title}</h1>
                  {activeCategory.description && (
                    <p className="category-inner-desc">{activeCategory.description}</p>
                  )}
                </div>

                <div className="category-count-badge">
                  {innerCourses.length} {innerCourses.length === 1 ? "Programme" : "Programmes"}
                </div>
              </div>
            </div>
          </section>

          {/* Inner Courses Cards Grid */}
          {innerCourses.length === 0 ? (
            <section className="container" style={{ padding: "40px 0 120px", textAlign: "center" }}>
              <div
                style={{
                  background: "#fff",
                  border: "1px dashed var(--border)",
                  padding: "50px 20px",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <p style={{ fontSize: "16px", color: "var(--muted)", fontStyle: "italic", marginBottom: "15px" }}>
                  No programmes have been published under {activeCategory.title} yet.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleBackToCategories}
                  style={{
                    padding: "8px 18px",
                    background: "#171717",
                    color: "#fff",
                    border: "none",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ← Return to All Categories
                </button>
              </div>
            </section>
          ) : (
            <section className="courses container">
              {innerCourses.map((course, idx) => {
                const formattedNum = String(idx + 1).padStart(2, "0");
                const courseTitle =
                  course.courseName || course.title || course.general?.courseName || "Programme Title";
                const courseCode = course.courseCode || course.general?.courseCode || "";
                const courseDesc =
                  course.shortDescription ||
                  course.description ||
                  course.general?.shortDescription ||
                  "";
                const courseDuration = course.duration || course.general?.duration || "3 Years";
                const courseSemesters = course.semesters || course.general?.semesters || "6";
                const courseMode = course.mode || course.general?.mode || "Full Time";
                const courseImage =
                  (typeof course.image === "object" ? course.image?.url : course.image) ||
                  (typeof course.general?.image === "object"
                    ? course.general?.image?.url
                    : course.general?.image) ||
                  "";

                return (
                  <article
                    key={course.id || course._id || idx}
                    className="course-card"
                    onClick={() => handleOpenCourse(course, activeCategory)}
                  >
                    {/* Course Image */}
                    <div
                      className="course-image"
                      style={{
                        background: "#ece9e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {courseImage ? (
                        <img src={courseImage} alt={courseTitle} />
                      ) : (
                        <div
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "32px",
                            color: "#9e9484",
                            letterSpacing: "0.05em",
                            fontWeight: 500,
                          }}
                        >
                          {courseCode || formattedNum}
                        </div>
                      )}
                      <div className="course-number">{formattedNum}</div>
                    </div>

                    {/* Course Content */}
                    <div className="course-content">
                      <div className="course-top">
                        <h2>{courseTitle}</h2>
                        {courseCode && <div className="course-code">{courseCode}</div>}
                        {courseDesc && <p className="course-description">{courseDesc}</p>}
                      </div>

                      <div className="course-bottom">
                        <div className="course-meta">
                          <div className="meta-item">
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">{courseDuration}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Semesters</span>
                            <span className="meta-value">{courseSemesters}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Mode</span>
                            <span className="meta-value">{courseMode}</span>
                          </div>
                        </div>

                        <div className="arrow">→</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: PARENT CATEGORY CARDS VIEW (Level 1 Outer Cards - All Categories Visible)
  // =========================================================================
  return (
    <div key="courses-directory-root" className="courses-scope page-transition">
      <main id="coursesPage">
        {/* Page Header */}
        <section className="page-header container">
          <div className="eyebrow">{internalData?.kicker || "Academic Programmes & Faculties"}</div>

          <h1 className="page-title">{internalData?.title || "Courses & Programmes"}</h1>

          <p className="page-description">
            {internalData?.description ||
              "Explore our academic programmes across diverse degree levels, doctoral studies, and flexible distance education opportunities."}
          </p>
        </section>

        {/* Parent Category Cards Grid */}
        {categories.length === 0 ? (
          <section className="container" style={{ padding: "60px 0 120px", textAlign: "center" }}>
            <p style={{ fontSize: "17px", color: "var(--muted)", fontStyle: "italic" }}>
              No academic categories or programmes have been published yet.
            </p>
          </section>
        ) : (
          <section className="container" style={{ paddingBottom: "120px" }}>
            <div className="parent-categories-grid">
              {categories.map((cat, idx) => {
                const formattedNum = String(idx + 1).padStart(2, "0");
                const count = (cat.courses || []).length;
                const catImg =
                  (typeof cat.image === "object" ? cat.image?.url : cat.image) || "";
                const kicker = cat.badge || cat.code || "Academic Discipline";

                return (
                  <article
                    key={cat.id || idx}
                    className="parent-card"
                    onClick={() => handleOpenCategory(cat)}
                  >
                    {/* Optional Featured Image Header */}
                    {catImg && (
                      <div className="parent-card-media">
                        <img src={catImg} alt={cat.title} />
                      </div>
                    )}

                    {/* Main Editorial Card Body */}
                    <div className="parent-card-body">
                      {/* Top Row: Kicker Badge & Index Number */}
                      <div className="parent-card-topbar">
                        <span className="parent-card-kicker-pill">
                          {kicker}
                        </span>

                        <span className="parent-card-index">
                          {formattedNum}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h2 className="parent-card-title">{cat.title}</h2>

                      {cat.subtitle && (
                        <p className="parent-card-subtitle">{cat.subtitle}</p>
                      )}

                      {/* Description */}
                      {cat.description && (
                        <p className="parent-card-description">{cat.description}</p>
                      )}

                      {/* Key Academic Specs Strip */}
                      <div className="parent-card-specs">
                        <div className="spec-item">
                          <span className="spec-label">Programmes</span>
                          <span className="spec-value">{count} Total</span>
                        </div>
                        <div className="spec-divider" />
                        <div className="spec-item">
                          <span className="spec-label">Curriculum</span>
                          <span className="spec-value">UGC / CBCS</span>
                        </div>
                        <div className="spec-divider" />
                        <div className="spec-item">
                          <span className="spec-label">Study Mode</span>
                          <span className="spec-value">Full Time</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="parent-card-footer">
                      <span className="parent-card-action">
                        <span>Explore Degrees</span>
                        <span className="parent-card-arrow">→</span>
                      </span>

                      <span className="parent-card-status">
                        {count > 0 ? "Admissions Open" : "Available"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CoursesDirectory;
