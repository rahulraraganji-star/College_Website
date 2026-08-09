import "./FacultyCard.css";

const FacultyCard = ({ member }) => {
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

  return (
    <article className="faculty-card">

      {/* IMAGE */}
      <div className="faculty-media">
        {media?.url ? (
          <img
            src={media.url}
            alt={media.alt || name}
            className="faculty-image"
          />
        ) : (
          <div className="faculty-placeholder">
            No Photo
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

        {bio && (
          <p className="faculty-bio">
            {bio}
          </p>
        )}

        <ul className="faculty-stats">
          <li>
            <span className="num">
              {experience || "-"}
            </span>
          </li>

          <li>
            <span className="num">
              {qualification || "-"}
            </span>
          </li>

          <li>
            <span className="num">
              {specialization || "-"}
            </span>
          </li>
        </ul>

        <div className="faculty-contact">
          {email && <p>{email}</p>}
          {phone && <p>{phone}</p>}
        </div>

      </div>

    </article>
  );
};

export default FacultyCard;