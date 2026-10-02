/**
 * The recurring "eyebrow label + Fraunces heading" treatment used at the
 * top of Timeline, Faculty, Gallery, Documents, Events and Table
 * sections. Repeating this exact pattern site-wide gives the
 * page consistent editorial rhythm.
 */
const SectionHeading = ({ eyebrow, title, subtitle }) => {
  if (!title && !eyebrow && !subtitle) return null;
  return (
    <div className="mb-8 md:mb-10">
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555]" />
          <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.2em] font-semibold text-[#8A6B3F]">
            {eyebrow}
          </p>
        </div>
      )}
      {title && (
        <h2 className="font-['Fraunces'] text-[26px] sm:text-[30px] md:text-[34px] font-medium text-[#2A2623] tracking-tight leading-snug">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-3 font-['Inter'] text-[15px] sm:text-[16px] leading-relaxed text-[#5C554C] max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;

