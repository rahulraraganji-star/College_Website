/**
 * Small uppercase dateline/kicker label — the signature motif repeated
 * across the Hero, Editorial Intro and every Content Section. This is
 * what ties the page's independently-authored CMS blocks into one
 * running "publication" thread instead of a stack of unrelated widgets.
 */
const PageKicker = ({ title, dark = false, className = "" }) => {
  if (!title) return null;
  return (
    <p
      className={`
        font-['IBM_Plex_Mono']
        text-[11px]
        uppercase
        tracking-[0.22em]
        mb-3
        ${dark ? "text-[#F8F5F0]/70" : "text-[#8A6B3F]"}
        ${className}
      `}
    >
      {title}
    </p>
  );
};

export default PageKicker;
