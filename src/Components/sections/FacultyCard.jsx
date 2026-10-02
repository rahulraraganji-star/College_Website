import { useState } from "react";
import FacultyOverlay from "./FacultyOverlay";
import "./FacultyCard.css";

const FacultyCard = ({ member }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

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
  } = member;

  const photoUrl =
    (typeof media === "object" ? media?.url : media) ||
    (typeof member.photo === "object" ? member.photo?.url : member.photo) ||
    (typeof member.image === "object" ? member.image?.url : member.image) ||
    null;

  // Only enable overlay if at least one extended detail is actually filled in
  const hasOverlayDetails = Boolean(
    member?.officeLocation?.trim() ||
    member?.officeHours?.trim() ||
    member?.linkedin?.trim() ||
    member?.googleScholar?.trim() ||
    member?.website?.trim() ||
    member?.education?.trim() ||
    member?.researchInterests?.trim() ||
    member?.publications?.trim() ||
    member?.coursesTaught?.trim() ||
    member?.awards?.trim()
  );

  return (
    <>
      <article
        className={`faculty-card ${hasOverlayDetails ? "has-overlay" : ""}`}
        onClick={hasOverlayDetails ? () => setIsOverlayOpen(true) : undefined}
        role={hasOverlayDetails ? "button" : undefined}
        tabIndex={hasOverlayDetails ? 0 : undefined}
        onKeyDown={
          hasOverlayDetails
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOverlayOpen(true);
                }
              }
            : undefined
        }
        title={hasOverlayDetails ? `Click to view full profile of ${name}` : undefined}
      >

      {/* IMAGE */}
      <div className="faculty-media">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={media?.alt || name}
            loading="lazy"
            decoding="async"
            className="faculty-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const nextEl = e.currentTarget.nextElementSibling;
              if (nextEl && nextEl.classList.contains("faculty-placeholder")) {
                nextEl.style.display = "flex";
              }
            }}
          />
        ) : (
          <div className="faculty-placeholder">
            <div className="faculty-placeholder-inner">
              <div className="faculty-placeholder-avatar">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="faculty-placeholder-icon"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="faculty-placeholder-text">Faculty Member</span>
            </div>
          </div>
        )}

        <div className="faculty-media-veil" />
      </div>

      {/* FRONT CONTENT */}
      <div className="faculty-face">
        {designation && (
          <p className="faculty-eyebrow">
            {designation}
          </p>
        )}

        <h2 className="faculty-name">
          {name}
          <span className="faculty-chalk" />
        </h2>

        {department && (
          <p className="faculty-dept">
            {department}
          </p>
        )}
      </div>

      {/* HOVER PANEL */}
      <div className="faculty-panel">
        <div className="faculty-panel-header">
          <span className="faculty-panel-kicker">Faculty Profile</span>
        </div>

        {bio && (
          <p className="faculty-bio">
            {bio}
          </p>
        )}

        <ul className="faculty-stats">
          <li>
            <span className="label">Experience</span>
            <span className="num" title={experience || ""}>
              {experience || "-"}
            </span>
          </li>

          <li>
            <span className="label">Degree</span>
            <span className="num" title={qualification || ""}>
              {qualification || "-"}
            </span>
          </li>

          <li>
            <span className="label">Focus</span>
            <span className="num" title={specialization || ""}>
              {specialization || "-"}
            </span>
          </li>
        </ul>

        {(email || phone) && (
          <div className="faculty-contact">
            {email && (
              <p
                className="faculty-contact-row"
                title={email}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${email}`;
                }}
              >
                <svg
                  className="faculty-contact-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="faculty-contact-text">{email}</span>
              </p>
            )}
            {phone && (
              <p
                className="faculty-contact-row"
                title={phone}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${phone}`;
                }}
              >
                <svg
                  className="faculty-contact-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="faculty-contact-text">{phone}</span>
              </p>
            )}
          </div>
        )}

        {/* VIEW FULL PROFILE PROMPT - ONLY WHEN OVERLAY DETAILS ARE GIVEN */}
        {hasOverlayDetails && (
          <div className="faculty-click-hint">
            <span>View Detailed Profile</span>
            <svg
              className="faculty-hint-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        )}

      </div>

    </article>

    {/* OVERLAY MODAL - ONLY WHEN OVERLAY DETAILS ARE GIVEN */}
    {hasOverlayDetails && (
      <FacultyOverlay
        member={member}
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
      />
    )}
  </>
  );
};

export default FacultyCard;