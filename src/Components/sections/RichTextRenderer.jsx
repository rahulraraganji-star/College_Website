import React, { useMemo } from "react";
import { Quote } from "lucide-react";

/**
 * Editorial Rich Text Renderer
 * Transforms raw HTML or multiline text from CMS into a publication-grade layout.
 * Ensures zero content loss while delivering world-class institutional typography.
 */

// Helper to determine if a string contains HTML structure
const isHTML = (str) => {
  if (!str || typeof str !== "string") return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

/**
 * Parses raw HTML into structured React nodes with editorial typography enhancements.
 */
const HTMLRenderer = ({ html, isFirstBlock = false }) => {
  // We parse the HTML into DOM elements and enhance them
  const renderedContent = useMemo(() => {
    if (!html) return null;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const elements = Array.from(doc.body.childNodes);

      let paragraphCount = 0;

      return elements.map((node, index) => {
        // Text node
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (!text) return null;
          return (
            <p key={index} className="font-['Inter'] text-[16px] md:text-[17px] leading-8 text-[#4A433B] mb-6">
              {text}
            </p>
          );
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          const innerHtml = node.innerHTML;
          const textContent = node.textContent || "";

          // Headings
          if (tagName === "h1") {
            return (
              <h1
                key={index}
                className="font-['Fraunces'] text-[32px] md:text-[40px] font-medium text-[#2A2623] tracking-tight leading-tight mt-10 mb-5"
                dangerouslySetInnerHTML={{ __html: innerHtml }}
              />
            );
          }

          if (tagName === "h2") {
            return (
              <div key={index} className="mt-12 mb-6 group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-[2px] w-6 bg-[#C9A555] rounded-full" />
                  <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A6B3F]">
                    Section
                  </span>
                </div>
                <h2
                  className="font-['Fraunces'] text-[26px] md:text-[32px] font-medium text-[#2A2623] tracking-tight leading-snug"
                  dangerouslySetInnerHTML={{ __html: innerHtml }}
                />
              </div>
            );
          }

          if (tagName === "h3") {
            return (
              <h3
                key={index}
                className="font-['Fraunces'] text-[21px] md:text-[24px] font-medium text-[#2A2623] tracking-tight leading-snug mt-8 mb-4 border-l-2 border-[#C9A555] pl-4"
                dangerouslySetInnerHTML={{ __html: innerHtml }}
              />
            );
          }

          if (tagName === "h4" || tagName === "h5" || tagName === "h6") {
            return (
              <h4
                key={index}
                className="font-['Inter'] text-[16px] md:text-[18px] font-semibold text-[#2A2623] tracking-tight mt-6 mb-3"
                dangerouslySetInnerHTML={{ __html: innerHtml }}
              />
            );
          }

          // Paragraphs
          if (tagName === "p") {
            paragraphCount++;
            const isLead = isFirstBlock && paragraphCount === 1 && textContent.length > 50;

            // Check if paragraph is just an author sign-off (e.g. <strong>Dr. Name</strong><br>Title)
            const isSignoff = /<strong>.*<\/strong>\s*(<br\/?>)?/i.test(innerHtml) && textContent.length < 120 && node.previousElementSibling;

            if (isSignoff) {
              return (
                <div
                  key={index}
                  className="mt-8 pt-6 border-t border-[#E6DED3] max-w-md"
                >
                  <div
                    className="font-['Inter'] text-[15px] leading-relaxed text-[#2A2623] [&>strong]:font-semibold [&>strong]:text-[#1E1B18] [&>strong]:text-[17px] [&>strong]:font-['Fraunces'] [&>strong]:block [&>strong]:mb-1"
                    dangerouslySetInnerHTML={{ __html: innerHtml }}
                  />
                </div>
              );
            }

            return (
              <p
                key={index}
                className={`font-['Inter'] text-[#4A433B] mb-6 last:mb-0 ${
                  isLead
                    ? "editorial-lead text-[18px] md:text-[20px] leading-[1.75] text-[#24201D] font-normal"
                    : "text-[16px] md:text-[17px] leading-8 font-normal"
                } [&>strong]:font-semibold [&>strong]:text-[#1E1B18] [&>a]:text-[#8A6B3F] [&>a]:underline [&>a]:underline-offset-4 hover:[&>a]:text-[#C9A555]`}
                dangerouslySetInnerHTML={{ __html: innerHtml }}
              />
            );
          }

          // Blockquote
          if (tagName === "blockquote") {
            return (
              <div
                key={index}
                className="my-10 relative overflow-hidden rounded-2xl bg-[#FBF9F5] border-l-4 border-[#C9A555] p-6 sm:p-8 shadow-sm"
              >
                <div className="absolute top-4 right-5 opacity-10 pointer-events-none text-[#8A6B3F]">
                  <Quote size={56} />
                </div>
                <blockquote
                  className="font-['Fraunces'] italic text-[18px] sm:text-[21px] md:text-[22px] leading-[1.6] text-[#2A2623] relative z-10"
                  dangerouslySetInnerHTML={{ __html: innerHtml }}
                />
              </div>
            );
          }

          // Lists
          if (tagName === "ul") {
            const listItems = Array.from(node.querySelectorAll(":scope > li"));
            return (
              <ul key={index} className="my-6 space-y-3.5 pl-1">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx} className="flex items-start gap-3 text-[16px] md:text-[17px] leading-7 text-[#4A433B]">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C9A555] shrink-0" />
                    <span
                      className="flex-1 [&>strong]:font-semibold [&>strong]:text-[#1E1B18]"
                      dangerouslySetInnerHTML={{ __html: li.innerHTML }}
                    />
                  </li>
                ))}
              </ul>
            );
          }

          if (tagName === "ol") {
            const listItems = Array.from(node.querySelectorAll(":scope > li"));
            return (
              <ol key={index} className="my-8 space-y-4">
                {listItems.map((li, liIdx) => (
                  <li
                    key={liIdx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-[#E6DED3]/80 transition-all hover:border-[#C9A555]/60 hover:bg-white"
                  >
                    <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#8A6B3F]/10 text-[#8A6B3F] font-['IBM_Plex_Mono'] text-xs font-semibold">
                      {String(liIdx + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="flex-1 font-['Inter'] text-[15px] md:text-[16px] leading-7 text-[#4A433B] pt-0.5 [&>strong]:font-semibold [&>strong]:text-[#1E1B18]"
                      dangerouslySetInnerHTML={{ __html: li.innerHTML }}
                    />
                  </li>
                ))}
              </ol>
            );
          }

          // Tables
          if (tagName === "table") {
            return (
              <div
                key={index}
                className="my-8 w-full overflow-x-auto rounded-xl border border-[#E6DED3] bg-white shadow-sm [-webkit-overflow-scrolling:touch]"
              >
                <div
                  className="editorial-prose min-w-[500px]"
                  dangerouslySetInnerHTML={{ __html: node.outerHTML }}
                />
              </div>
            );
          }

          // Horizontal rule
          if (tagName === "hr") {
            return (
              <div key={index} className="my-10 flex items-center justify-center gap-3">
                <span className="h-px flex-1 bg-[#E6DED3]" />
                <span className="w-2 h-2 rotate-45 border border-[#C9A555] bg-[#F8F5F0]" />
                <span className="h-px flex-1 bg-[#E6DED3]" />
              </div>
            );
          }

          // Images
          if (tagName === "img" || node.querySelector("img")) {
            const img = tagName === "img" ? node : node.querySelector("img");
            const src = img?.getAttribute("src") || "";
            const alt = img?.getAttribute("alt") || "";
            return (
              <figure key={index} className="my-8 rounded-2xl overflow-hidden border border-[#E6DED3] bg-white shadow-sm">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto object-cover max-h-[500px]"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="p-3.5 text-center font-['Inter'] text-xs text-[#7A7268] border-t border-[#E6DED3] bg-[#FBF9F5]">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          }

          // Generic div/other element fallback
          return (
            <div
              key={index}
              className="editorial-prose mb-6"
              dangerouslySetInnerHTML={{ __html: node.outerHTML }}
            />
          );
        }

        return null;
      });
    } catch (e) {
      console.warn("Error parsing HTML content in RichTextRenderer:", e);
      return (
        <div
          className="editorial-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }, [html, isFirstBlock]);

  return <div className="editorial-prose w-full">{renderedContent}</div>;
};

/**
 * Plain Text / Markdown Formatter
 */
const PlainTextRenderer = ({ content, isFirstBlock = false }) => {
  const paragraphs = useMemo(() => {
    return (content || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [content]);

  if (paragraphs.length === 0) return null;

  return (
    <div className="space-y-6">
      {paragraphs.map((para, i) => {
        // Check for Markdown Header: # or ##
        if (para.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="font-['Fraunces'] text-[21px] md:text-[24px] font-medium text-[#2A2623] tracking-tight mt-8 mb-4 border-l-2 border-[#C9A555] pl-4"
            >
              {para.replace(/^###\s+/, "")}
            </h3>
          );
        }

        if (para.startsWith("## ")) {
          return (
            <div key={i} className="mt-10 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-[2px] w-6 bg-[#C9A555] rounded-full" />
                <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A6B3F]">
                  Section
                </span>
              </div>
              <h2 className="font-['Fraunces'] text-[26px] md:text-[32px] font-medium text-[#2A2623] tracking-tight">
                {para.replace(/^##\s+/, "")}
              </h2>
            </div>
          );
        }

        // Check for Blockquote: > Quote
        if (para.startsWith("> ")) {
          return (
            <div
              key={i}
              className="my-8 relative overflow-hidden rounded-2xl bg-[#FBF9F5] border-l-4 border-[#C9A555] p-6 sm:p-8 shadow-sm"
            >
              <div className="absolute top-4 right-5 opacity-10 pointer-events-none text-[#8A6B3F]">
                <Quote size={56} />
              </div>
              <blockquote className="font-['Fraunces'] italic text-[18px] sm:text-[21px] leading-[1.6] text-[#2A2623] relative z-10">
                "{para.replace(/^>\s+/, "")}"
              </blockquote>
            </div>
          );
        }

        // Check for Bullet list block
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        const isBulletList = lines.every((l) => l.startsWith("- ") || l.startsWith("* "));
        if (isBulletList) {
          return (
            <ul key={i} className="my-6 space-y-3.5 pl-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3 text-[16px] md:text-[17px] leading-7 text-[#4A433B]">
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C9A555] shrink-0" />
                  <span>{line.replace(/^[-*]\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Check for Numbered list block
        const isNumberedList = lines.every((l) => /^\d+\.\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={i} className="my-8 space-y-4">
              {lines.map((line, lIdx) => {
                const match = line.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : String(lIdx + 1);
                const text = match ? match[2] : line;
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-[#E6DED3]/80 transition-all hover:border-[#C9A555]/60 hover:bg-white"
                  >
                    <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#8A6B3F]/10 text-[#8A6B3F] font-['IBM_Plex_Mono'] text-xs font-semibold">
                      {num.padStart(2, "0")}
                    </span>
                    <p className="flex-1 font-['Inter'] text-[15px] md:text-[16px] leading-7 text-[#4A433B] pt-0.5">
                      {text}
                    </p>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular Paragraph with Lead detection
        const isLead = isFirstBlock && i === 0 && para.length > 50;
        return (
          <p
            key={i}
            className={`font-['Inter'] whitespace-pre-wrap ${
              isLead
                ? "editorial-lead text-[18px] md:text-[20px] leading-[1.75] text-[#24201D] font-normal"
                : "text-[16px] md:text-[17px] leading-8 font-normal text-[#4A433B]"
            }`}
          >
            {para}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Main RichTextRenderer Component
 */
const RichTextRenderer = ({ content, isFirstBlock = false }) => {
  if (!content) return null;

  const hasHtml = isHTML(content);

  if (hasHtml) {
    return <HTMLRenderer html={content} isFirstBlock={isFirstBlock} />;
  }

  return <PlainTextRenderer content={content} isFirstBlock={isFirstBlock} />;
};

export default RichTextRenderer;
