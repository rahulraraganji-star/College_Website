/**
 * The recurring "eyebrow label + Fraunces heading" treatment used at the
 * top of Timeline, Faculty, Gallery, Documents, Events and Table
 * sections. Repeating this exact pattern site-wide is what gives the
 * page consistent rhythm instead of each CMS block inventing its own
 * heading style.
 */
const SectionHeading = ({ eyebrow, title }) => {
  if (!title) return null;
  return (
    <div className="mb-10 md:mb-12">
      {eyebrow && (
        <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.22em] text-[#8A6B3F] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-['Fraunces'] text-[28px] md:text-[36px] font-medium text-[#2A2623] tracking-tight">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeading;
