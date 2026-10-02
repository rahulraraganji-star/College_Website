import React, { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import RichTextRenderer from "./RichTextRenderer";
import { getCleanImageUrl } from "../../utils/imageUrl";

const PrincipalMessageBlock = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  if (!item) return null;

  const {
    title = "Principal’s Message",
    name = "",
    designation = "Principal",
    message = "",
    media,
  } = item;

  const rawPhoto =
    (typeof media === "object" ? media?.url : media) || null;
  const photoUrl = getCleanImageUrl(rawPhoto);
  const photoAlt =
    media?.alt || (name ? `${name} - ${designation}` : "Principal Photo");

  // Determine if message is long enough to need "Read More"
  const isLongMessage =
    Boolean(message) &&
    (message.length > 250 || message.includes("\n"));

  const handleToggle = () => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <article
      ref={cardRef}
      className="w-full mt-0 mb-6 bg-white rounded-2xl border border-[#E6DED3] p-6 sm:p-8 lg:p-10 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] gap-8 lg:gap-12">
        {/* LEFT COLUMN: Stretches full height of row so sticky child has scroll track */}
        <div className="w-full max-w-[250px] mx-auto md:mx-0">
          {/* Pinned portrait stays fixed at top-24 / top-28 as user scrolls text */}
          <div className="md:sticky md:top-24 lg:top-28 z-10 flex flex-col items-center sm:items-start">
            {/* Photo Frame */}
            <div className="w-full">
            <div className="relative rounded-2xl overflow-hidden border border-[#E6DED3] bg-[#FAF8F5] p-2.5 shadow-sm group">
              {photoUrl ? (
                <div className="overflow-hidden rounded-xl bg-[#2A2623]/5 aspect-[3/4]">
                  <img
                    src={photoUrl}
                    alt={photoAlt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-[#2A2623]/5 aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#8A6B3F]/10 flex items-center justify-center text-[#8A6B3F] mb-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-[#7A7268]">
                    Principal Photo
                  </span>
                </div>
              )}

              {/* Photo Caption / Credentials in Frame */}
              <div className="pt-4 pb-1 px-2 text-center sm:text-left">
                {name && (
                  <h3 className="font-['Fraunces'] text-lg sm:text-xl font-medium text-[#2A2623] leading-snug">
                    {name}
                  </h3>
                )}
                {designation && (
                  <p className="font-['IBM_Plex_Mono'] text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#8A6B3F] font-semibold mt-1">
                    {designation}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* RIGHT COLUMN: Heading, Message & Expandable Content */}
        <div className="flex flex-col justify-between min-w-0 w-full">
          <div>
            {/* Eyebrow Label */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555]" />
              <p className="font-['IBM_Plex_Mono'] text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-[#8A6B3F]">
                Institutional Leadership
              </p>
            </div>

            {/* Title */}
            {title && (
              <h2 className="font-['Fraunces'] text-2xl sm:text-3xl md:text-4xl font-medium text-[#2A2623] tracking-tight leading-snug mb-3">
                {title}
              </h2>
            )}

            {/* Gold Accent Divider */}
            <div className="w-12 h-[2px] bg-[#C9A555] rounded-full mb-6 sm:mb-8" />

            {/* Message Content with Collapsible Container */}
            <div className="relative">
              <div
                className={`prose max-w-none text-[#4A433B] transition-all duration-500 ease-in-out ${
                  isLongMessage && !isExpanded
                    ? "max-h-[220px] sm:max-h-[260px] overflow-hidden"
                    : "max-h-none"
                }`}
              >
                {message ? (
                  <RichTextRenderer content={message} isFirstBlock={true} />
                ) : (
                  <p className="font-['Inter'] italic text-sm text-[#7A7268]">
                    Principal's message will be updated shortly.
                  </p>
                )}
              </div>

              {/* Gradient Fade Overlay when Collapsed */}
              {isLongMessage && !isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Read More / Read Less Toggle Button */}
            {isLongMessage && (
              <div className="mt-4 pt-1 flex items-center">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#C9A555]/40 bg-[#FAF8F5] text-[#2A2623] hover:bg-[#F3EFE6] hover:border-[#C9A555] active:scale-[0.98] transition-all font-['Inter'] text-sm font-semibold shadow-sm group"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? "Show Less" : "Read Full Message"}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#8A6B3F] transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : "group-hover:translate-y-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Formal Closing & Sign-off Block (Visible when expanded or message is short) */}
          {(name || designation) && (!isLongMessage || isExpanded) && (
            <div className="mt-10 pt-6 border-t border-[#E6DED3] flex flex-col items-start animate-fadeIn">
              <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.16em] text-[#8A6B3F] font-medium mb-1">
                Warm Regards & Best Wishes,
              </span>
              {name && (
                <span className="font-['Fraunces'] text-xl font-medium text-[#2A2623] mt-1">
                  {name}
                </span>
              )}
              {designation && (
                <span className="font-['Inter'] text-sm text-[#5C554C]">
                  {designation}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PrincipalMessageBlock;
