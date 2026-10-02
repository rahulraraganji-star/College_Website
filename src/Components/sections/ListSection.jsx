import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Unwrap and intelligently parse list item data
const parseListItem = (item) => {
  if (!item) return { title: "", description: "" };

  let title = "";
  let description = "";

  if (typeof item === "string") {
    description = item.trim();
  } else if (typeof item === "object") {
    title = item.label || item.title || item.name || item.heading || "";
    let descVal =
      item.description || item.desc || item.text || item.content || item.value || "";
    while (descVal && typeof descVal === "object") {
      descVal = descVal.text || descVal.description || descVal.content || "";
    }
    description = String(descVal || "").trim();
  }

  // If title is missing but description has multiple lines or a colon separator, parse it
  if (!title && description) {
    if (description.includes("\n")) {
      const parts = description.split("\n").map((s) => s.trim()).filter(Boolean);
      title = parts[0];
      description = parts.slice(1).join(" ");
    } else if (description.includes(" : ")) {
      const parts = description.split(" : ");
      title = parts[0].trim();
      description = parts.slice(1).join(" : ").trim();
    }
  }

  return {
    title: String(title || "").trim(),
    description: String(description || "").trim(),
  };
};

const ListSection = ({ section }) => {
  const items = section.items || [];
  if (items.length === 0) return null;

  const parsedItems = items
    .map(parseListItem)
    .filter((item) => item.title || item.description);

  if (parsedItems.length === 0) return null;

  const isEditorial = section.layout === "editorial";

  const eyebrow =
    section.eyebrow !== undefined
      ? section.eyebrow
      : "Highlights & Values";

  const subtitle = section.subtitle || section.subheading;

  return (
    <Reveal>
      <div className="pt-12 md:pt-16 border-t border-[#E6DED3]">
        {/* Section Heading & Subtitle */}
        {(section.title || eyebrow || subtitle) && (
          isEditorial ? (
            <SectionHeading
              eyebrow={eyebrow}
              title={section.title}
              subtitle={subtitle}
            />
          ) : (
            <div className="mb-8">
              {eyebrow && (
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9A555]" />
                  <p className="font-['IBM_Plex_Mono',_monospace] text-[11px] sm:text-[12px] uppercase tracking-[0.22em] font-bold text-[#75521B]">
                    {eyebrow}
                  </p>
                </div>
              )}
              {section.title && (
                <h2
                  className="font-heading text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#110F0D] tracking-tight leading-snug mb-2.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                >
                  {section.title}
                </h2>
              )}
              {subtitle && (
                <p className="font-['Inter',_sans-serif] text-[15px] sm:text-[16px] font-medium text-[#363029] leading-relaxed max-w-3xl">
                  {subtitle}
                </p>
              )}
            </div>
          )
        )}

        {/* Section Layout Rendering */}
        {isEditorial ? (
          /* =====================================================
             EDITORIAL CARDS (PRESTIGIOUS, ATTRACTIVE, BOLD, NO HOVER)
          ====================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-6">
            {parsedItems.map((item, i) => {
              const hasDescription =
                Boolean(item.description) &&
                item.description.trim() !== item.title.trim();

              return (
                <div
                  key={i}
                  className="rounded-2xl border-t-[3px] border-t-[#C9A555] border-x border-b border-[#E2D9CC] bg-white p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                >
                  {/* Top Folio Bar */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#EFE9DF]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FBF7F0] border border-[#E8DFC8] text-[#75521B] font-['IBM_Plex_Mono',_monospace] text-[11.5px] font-bold tracking-wider">
                      <span className="text-[#8F6A33]">NO.</span>
                      <span className="text-[#110F0D] font-extrabold">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#C9A555]" />
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0">
                    {item.title ? (
                      <h3
                        className="font-heading text-[18px] sm:text-[20px] font-bold leading-[1.35] text-[#110F0D] tracking-[-0.015em]"
                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                      >
                        {item.title}
                      </h3>
                    ) : item.description ? (
                      <h3
                        className="font-heading text-[18px] sm:text-[20px] font-bold leading-[1.35] text-[#110F0D] tracking-[-0.015em]"
                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                      >
                        {item.description}
                      </h3>
                    ) : null}

                    {item.title && hasDescription && (
                      <p
                        className="font-['Inter',_sans-serif] text-[14.5px] sm:text-[15.5px] font-medium leading-relaxed text-[#363029] mt-2.5"
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =====================================================
             RECTANGLE BOXES (OLD / CLASSIC DESIGN, BOLD, NO HOVER)
          ====================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parsedItems.map((item, i) => {
              const hasTitle = Boolean(item.title);
              const hasDescription =
                Boolean(item.description) &&
                item.description.trim() !== item.title.trim();

              return (
                <div
                  key={i}
                  className="flex items-start gap-4 border border-[#2A2623]/15 bg-white/70 p-5 rounded-lg shadow-sm"
                >
                  <span className="mt-2 w-2 h-2 bg-[#C9A555] shrink-0 rotate-45" />
                  <div className="flex-1 min-w-0">
                    {hasTitle ? (
                      <>
                        <strong
                          className="block font-heading font-bold text-[17px] sm:text-[18px] text-[#110F0D] mb-1.5 leading-snug"
                          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                        >
                          {item.title}
                        </strong>
                        {hasDescription && (
                          <p className="font-['Inter',_sans-serif] font-medium text-[14.5px] text-[#363029] leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </>
                    ) : (
                      <strong
                        className="block font-heading font-bold text-[17px] text-[#110F0D] leading-snug"
                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                      >
                        {item.description}
                      </strong>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Reveal>
  );
};

export default ListSection;

