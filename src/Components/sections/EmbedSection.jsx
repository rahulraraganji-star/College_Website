import SectionHeading from "./SectionHeading";
import { ExternalLink, Globe, ArrowUpRight } from "lucide-react";

// Safe domain parser for clean institutional badges
const getDomain = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.split("/")[0] || "";
  }
};

// Safe link URL formatter
const formatHref = (url) => {
  if (!url) return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

const EmbedSection = ({ section }) => {
  const isLinkType = section.embedType === "link";
  const attachedLinks = Array.isArray(section.links)
    ? section.links.filter((l) => Boolean(l?.url?.trim()))
    : [];

  // ========================================================
  // 1. LINK EMBED TYPE RENDERER
  // ========================================================
  if (isLinkType) {
    // Consolidate primary link and additional links
    const allLinks = [];

    // Primary link from section.url
    if (section.url?.trim()) {
      allLinks.push({
        id: "primary",
        title: section.linkText?.trim() || section.title?.trim() || "External Resource",
        url: section.url.trim(),
        description: section.description?.trim() || "",
        buttonText: section.buttonText?.trim() || "Open Link",
        openInNewTab: section.openInNewTab ?? true,
      });
    }

    // Additional links
    attachedLinks.forEach((lnk, idx) => {
      allLinks.push({
        id: lnk.id || `link_${idx}`,
        title: lnk.title?.trim() || `Resource Link ${idx + 1}`,
        url: lnk.url.trim(),
        description: lnk.description?.trim() || "",
        buttonText: lnk.buttonText?.trim() || "Open Link",
        openInNewTab: lnk.openInNewTab ?? true,
      });
    });

    if (allLinks.length === 0) return null;

    return (
      <section className="pt-14 sm:pt-18 md:pt-20 border-t border-[#E6DED3]">
        <SectionHeading
          eyebrow="Media & Resources"
          title={section.title || "External Resources & Links"}
        />

        {allLinks.length === 1 ? (
          /* Single Featured Link Card */
          <div className="group relative overflow-hidden rounded-2xl border border-[#E6DED3] bg-gradient-to-br from-white to-[#FAF8F5] p-7 md:p-9 shadow-xs hover:shadow-md hover:border-[#C9A555] transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['IBM_Plex_Mono'] font-medium bg-[#F4EDE2] text-[#8A6B3F] border border-[#E6DED3]">
                    <Globe size={13} className="shrink-0 text-[#8A6B3F]" />
                    <span className="truncate">{getDomain(allLinks[0].url)}</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555]" />
                  <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-[#7A7268]">
                    Official Link
                  </span>
                </div>

                <h3 className="font-['Inter'] text-base sm:text-lg font-semibold text-[#2A2623] tracking-tight leading-snug group-hover:text-[#8A6B3F] transition-colors">
                  {allLinks[0].title}
                </h3>

                {allLinks[0].description && (
                  <p className="font-['Inter'] text-xs sm:text-sm leading-relaxed text-[#5D554D]">
                    {allLinks[0].description}
                  </p>
                )}
              </div>

              <div className="shrink-0 pt-2 md:pt-0">
                <a
                  href={formatHref(allLinks[0].url)}
                  target={allLinks[0].openInNewTab ? "_blank" : undefined}
                  rel={allLinks[0].openInNewTab ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A2623] text-white text-xs font-['Inter'] font-medium shadow-sm hover:bg-[#8A6B3F] hover:shadow-md transition-all duration-200 group/btn"
                >
                  <span>{allLinks[0].buttonText || "Open Link"}</span>
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Multiple Links Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allLinks.map((linkItem) => (
              <div
                key={linkItem.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E6DED3] bg-white p-6 shadow-xs hover:border-[#C9A555] hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-['IBM_Plex_Mono'] font-medium bg-[#F4EDE2] text-[#8A6B3F] border border-[#E6DED3] max-w-[200px] truncate">
                      <Globe size={11} className="shrink-0" />
                      <span className="truncate">{getDomain(linkItem.url)}</span>
                    </span>
                    <ExternalLink size={14} className="text-[#7A7268] group-hover:text-[#8A6B3F] transition-colors shrink-0" />
                  </div>

                  <h3 className="font-['Inter'] text-sm sm:text-base font-semibold text-[#2A2623] tracking-tight leading-snug group-hover:text-[#8A6B3F] transition-colors">
                    {linkItem.title}
                  </h3>

                  {linkItem.description && (
                    <p className="font-['Inter'] text-xs sm:text-[13px] text-[#5D554D] line-clamp-2 leading-relaxed">
                      {linkItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
                  <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7A7268] truncate max-w-[180px]">
                    {getDomain(linkItem.url)}
                  </span>
                  <a
                    href={formatHref(linkItem.url)}
                    target={linkItem.openInNewTab ? "_blank" : undefined}
                    rel={linkItem.openInNewTab ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2623] text-white text-xs font-['Inter'] font-medium hover:bg-[#8A6B3F] transition-colors shadow-2xs group/btn"
                  >
                    <span>{linkItem.buttonText || "Open Link"}</span>
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ========================================================
  // 2. STANDARD IFRAME EMBED (YouTube, Maps, Forms, etc.)
  // ========================================================
  const src =
    section.embedType === "pdf"
      ? section.media?.url
      : section.url;

  if (!src && attachedLinks.length === 0) return null;

  return (
    <section className="pt-14 sm:pt-18 md:pt-20 border-t border-[#E6DED3]">
      <SectionHeading
        eyebrow="Media & Resources"
        title={section.title || "Embedded Resource"}
      />

      {src && (
        <div className="overflow-hidden rounded-2xl border border-[#E6DED3] bg-white shadow-sm">
          <iframe
            src={src}
            title={section.title || "Embedded Content"}
            width={section.responsive ? "100%" : section.width || "100%"}
            height={section.height || 540}
            loading={section.lazyLoad ? "lazy" : "eager"}
            allowFullScreen={section.allowFullscreen}
            className="border-0 w-full"
          />
        </div>
      )}

      {/* Attached Action Links Strip below iframe */}
      {attachedLinks.length > 0 && (
        <div className="mt-5 p-4 rounded-xl border border-[#E6DED3] bg-white/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555]" />
            <span className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-[#7A7268] font-medium">
              Resource Links
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {attachedLinks.map((lnk, idx) => (
              <a
                key={lnk.id || idx}
                href={formatHref(lnk.url)}
                target={lnk.openInNewTab !== false ? "_blank" : undefined}
                rel={lnk.openInNewTab !== false ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#E6DED3] text-xs font-['Inter'] font-medium text-[#2A2623] hover:border-[#C9A555] hover:text-[#8A6B3F] hover:shadow-2xs transition-all shadow-xs"
              >
                <span>{lnk.title || lnk.buttonText || `Link ${idx + 1}`}</span>
                <ExternalLink size={12} className="text-[#8A6B3F]" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default EmbedSection;
