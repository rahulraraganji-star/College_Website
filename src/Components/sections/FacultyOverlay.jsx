import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  Globe,
  Linkedin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import "./FacultyOverlay.css";

const FacultyOverlay = ({ member, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const {
    media,
    name,
    designation,
    department,
    bio,
    experience,
    qualification,
    specialization,
    email,
    phone,
    officeLocation,
    officeHours,
    linkedin,
    googleScholar,
    website,
    education,
    researchInterests,
    publications,
    coursesTaught,
    awards,
  } = member;

  const photoUrl =
    (typeof media === "object" ? media?.url : media) ||
    (typeof member.photo === "object" ? member.photo?.url : member.photo) ||
    (typeof member.image === "object" ? member.image?.url : member.image) ||
    null;

  // Backdrop click handler for light-dismiss
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="faculty-overlay-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faculty-overlay-name"
    >
      <div className="faculty-overlay-container">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="faculty-overlay-close-btn"
          aria-label="Close profile overlay"
        >
          <X size={20} />
        </button>

        {/* HERO / HEADER SECTION */}
        <div className="faculty-overlay-hero">
          <div className="faculty-overlay-avatar-wrap">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={media?.alt || name}
                className="faculty-overlay-avatar-img"
              />
            ) : (
              <div className="faculty-overlay-avatar-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="faculty-overlay-placeholder-svg"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          <div className="faculty-overlay-hero-info">
            {designation && (
              <p className="faculty-overlay-eyebrow">{designation}</p>
            )}
            <h2 id="faculty-overlay-name" className="faculty-overlay-name">
              {name}
            </h2>
            {department && (
              <div className="faculty-overlay-dept-pill">
                <span>{department}</span>
              </div>
            )}

            {/* QUICK CONTACT & LINKS CHIPS */}
            <div className="faculty-overlay-chips">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="faculty-overlay-chip"
                  title="Send Email"
                >
                  <Mail size={13} className="faculty-chip-icon" />
                  <span>{email}</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="faculty-overlay-chip"
                  title="Call Phone"
                >
                  <Phone size={13} className="faculty-chip-icon" />
                  <span>{phone}</span>
                </a>
              )}
              {officeLocation && (
                <div className="faculty-overlay-chip faculty-overlay-chip-static">
                  <MapPin size={13} className="faculty-chip-icon" />
                  <span>{officeLocation}</span>
                </div>
              )}
              {officeHours && (
                <div className="faculty-overlay-chip faculty-overlay-chip-static">
                  <Clock size={13} className="faculty-chip-icon" />
                  <span>{officeHours}</span>
                </div>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faculty-overlay-chip faculty-overlay-chip-link"
                >
                  <Linkedin size={13} className="faculty-chip-icon" />
                  <span>LinkedIn</span>
                  <ExternalLink size={10} />
                </a>
              )}
              {googleScholar && (
                <a
                  href={
                    googleScholar.startsWith("http")
                      ? googleScholar
                      : `https://${googleScholar}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faculty-overlay-chip faculty-overlay-chip-link"
                >
                  <BookOpen size={13} className="faculty-chip-icon" />
                  <span>Google Scholar</span>
                  <ExternalLink size={10} />
                </a>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faculty-overlay-chip faculty-overlay-chip-link"
                >
                  <Globe size={13} className="faculty-chip-icon" />
                  <span>Website</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* STATS HIGHLIGHT BAR */}
        <div className="faculty-overlay-stats-bar">
          <div className="faculty-overlay-stat-item">
            <span className="stat-label">Experience</span>
            <span className="stat-value">{experience || "—"}</span>
          </div>
          <div className="faculty-overlay-stat-item">
            <span className="stat-label">Qualification</span>
            <span className="stat-value">{qualification || "—"}</span>
          </div>
          <div className="faculty-overlay-stat-item">
            <span className="stat-label">Specialization</span>
            <span className="stat-value">{specialization || "—"}</span>
          </div>
          {officeLocation && (
            <div className="faculty-overlay-stat-item">
              <span className="stat-label">Cabin / Office</span>
              <span className="stat-value">{officeLocation}</span>
            </div>
          )}
        </div>

        {/* BODY SCROLL CONTENT */}
        <div className="faculty-overlay-body">
          {/* ABOUT / BIOGRAPHY */}
          {bio && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <Sparkles size={16} className="faculty-section-icon" />
                <h3>About & Biography</h3>
              </div>
              <p className="faculty-overlay-text">{bio}</p>
            </section>
          )}

          {/* EDUCATION & CREDENTIALS */}
          {education && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <GraduationCap size={16} className="faculty-section-icon" />
                <h3>Academic Qualifications & Education</h3>
              </div>
              <div className="faculty-overlay-formatted-text">
                {education.split("\n").map((line, idx) => (
                  <p key={idx} className="faculty-overlay-bullet-row">
                    <span className="faculty-bullet-dot" />
                    <span>{line.trim()}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* RESEARCH & SPECIALIZATION */}
          {(researchInterests || specialization) && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <Briefcase size={16} className="faculty-section-icon" />
                <h3>Research Interests & Areas of Expertise</h3>
              </div>
              <p className="faculty-overlay-text">
                {researchInterests || specialization}
              </p>
            </section>
          )}

          {/* PUBLICATIONS */}
          {publications && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <BookOpen size={16} className="faculty-section-icon" />
                <h3>Publications & Research Papers</h3>
              </div>
              <div className="faculty-overlay-formatted-text">
                {publications.split("\n").map((item, idx) => (
                  <p key={idx} className="faculty-overlay-bullet-row">
                    <span className="faculty-bullet-dot" />
                    <span>{item.trim()}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* COURSES / SUBJECTS TAUGHT */}
          {coursesTaught && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <BookOpen size={16} className="faculty-section-icon" />
                <h3>Courses & Subjects Handled</h3>
              </div>
              <div className="faculty-overlay-tag-list">
                {coursesTaught
                  .split(/[\n,;]/)
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((course, idx) => (
                    <span key={idx} className="faculty-overlay-tag">
                      {course}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {/* AWARDS & RECOGNITIONS */}
          {awards && (
            <section className="faculty-overlay-section">
              <div className="faculty-overlay-section-header">
                <Award size={16} className="faculty-section-icon" />
                <h3>Awards, Honors & Additional Responsibilities</h3>
              </div>
              <div className="faculty-overlay-formatted-text">
                {awards.split("\n").map((item, idx) => (
                  <p key={idx} className="faculty-overlay-bullet-row">
                    <span className="faculty-bullet-dot" />
                    <span>{item.trim()}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* FOOTER CALLOUT / NOTICE */}
          <div className="faculty-overlay-footer">
            <p>
              Faculty profiles are maintained by the institutional administration.
              For academic inquiries or office appointments, contact the faculty member directly via email or office phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FacultyOverlay;
