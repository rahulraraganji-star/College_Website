import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CoursesTemplate from "./CoursesTemplate";
import "./courses.css";

const CoursesDirectory = ({ data }) => {
  const [courses, setCourses] = useState([]);
  const [activeCourseDetail, setActiveCourseDetail] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let list = [];
    if (
      data?.courseData?.courses &&
      Array.isArray(data.courseData.courses)
    ) {
      list = data.courseData.courses.filter((c) => c.status !== "draft");
    }
    setCourses(list);

    // Check if URL specifies a particular course (?course=bca)
    const courseParam = searchParams.get("course");
    if (courseParam) {
      const found = list.find(
        (c) => c.slug === courseParam || c.courseCode?.toLowerCase() === courseParam.toLowerCase()
      );
      if (found) {
        setActiveCourseDetail(found);
      }
    }
  }, [data, searchParams]);

  // Open course detail view
  const handleOpenCourse = (courseItem) => {
    setActiveCourseDetail(courseItem);
    setSearchParams({ course: courseItem.slug || courseItem.courseCode?.toLowerCase() || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close course detail view and return to directory
  const handleCloseCourse = () => {
    setActiveCourseDetail(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If a course is selected, render Course Detail (CoursesTemplate)
  if (activeCourseDetail) {
    const courseDataObj = {
      title: activeCourseDetail.courseName || activeCourseDetail.title,
      slug: activeCourseDetail.slug,
      parentSlug: activeCourseDetail.parentSlug || data?.parentSlug || "academics",
      courseData: {
        general: {
          courseName: activeCourseDetail.courseName || activeCourseDetail.title,
          courseCode: activeCourseDetail.courseCode,
          slug: activeCourseDetail.slug,
          level: activeCourseDetail.level || "Undergraduate",
          duration: activeCourseDetail.duration || "3 Years",
          semesters: activeCourseDetail.semesters || "6",
          eligibility: activeCourseDetail.eligibility || "12th Pass",
          mode: activeCourseDetail.mode || "Full Time",
          image: activeCourseDetail.image,
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
        admission: activeCourseDetail.admission || {},
      },
    };

    return (
      <div key={activeCourseDetail.slug || activeCourseDetail.courseCode} className="page-transition">
        <CoursesTemplate data={courseDataObj} onBack={handleCloseCourse} />
      </div>
    );
  }

  // Otherwise render Courses Directory Page (Matching HTML/CSS Template)
  return (
    <div key="courses-directory-root" className="courses-scope page-transition">
      <main id="coursesPage">
        {/* Page Header */}
        <section className="page-header container">
          <div className="eyebrow">Academic Programmes</div>

          <h1 className="page-title">{data?.title || "Courses"}</h1>

          <p className="page-description">
            Explore our academic programmes and discover the opportunities, curriculum and learning
            experiences offered by the college.
          </p>
        </section>

        {/* Course Cards List */}
        {courses.length === 0 ? (
          <section className="container" style={{ padding: "60px 0 120px", textAlign: "center" }}>
            <p style={{ fontSize: "17px", color: "var(--muted)", fontStyle: "italic" }}>
              No academic programmes have been published yet.
            </p>
          </section>
        ) : (
          <section className="courses container">
            {courses.map((course, idx) => {
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
                  onClick={() => handleOpenCourse(course)}
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
};

export default CoursesDirectory;
