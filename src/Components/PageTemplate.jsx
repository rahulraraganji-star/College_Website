import Card from "./Card";
import { ArrowRight } from "lucide-react";

const hasData = (section) => {
  switch (section.type) {
    case "hero":
      return true;
    case "heading":
      return Boolean(section.text?.trim());
    case "richText":
      return Boolean(section.content?.trim());
    case "list":
      return Array.isArray(section.items) && section.items.length > 0;
    case "timeline":
      return Array.isArray(section.events) && section.events.length > 0;
    case "faculty-grid":
      return Array.isArray(section.departments) && section.departments.length > 0;
    case "gallery":
      return Array.isArray(section.images) && section.images.length > 0;
    case "table":
      return Array.isArray(section.rows) && section.rows.length > 0;
    case "documentList":
      return Array.isArray(section.documents) && section.documents.length > 0;
    case "eventList":
      return Array.isArray(section.events) && section.events.length > 0;
    case "embed":
      return Boolean(section.url);
    default:
      return false;
  }
};

const HERO_HEIGHT_CLASSES = {
  small: "min-h-[32vh]",
  medium: "min-h-[42vh]",
  large: "min-h-[55vh]",
  fullscreen: "min-h-[80vh]",
};

const HERO_ALIGN_CLASSES = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

// Small uppercase label showing the page's actual title.
// Always renders, regardless of whether a hero section is present,
// so the page name is never "lost" behind a custom hero heading.
const PageKicker = ({ title, dark }) => {
  if (!title) return null;
  return (
    <p
      className={`
        font-['Inter']
        text-[11px]
        uppercase
        tracking-[0.2em]
        mb-3
        ${dark ? "text-[#F8F5F0]/70" : "text-[#8A6B3F]"}
      `}
    >
      {title}
    </p>
  );
};

const PageTemplate = ({ data }) => {
  if (!data) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="font-['Inter'] text-[#2A2623]/40 text-lg">
          No content available
        </p>
      </div>
    );
  }

  const safeSections = Array.isArray(data.sections) ? data.sections : [];

  const heroSection = safeSections.find(
    (section) => section.type === "hero"
  );

  const heroSections = heroSection ? [heroSection] : [];

  const contentSections = safeSections.filter(
    (section) => section.type !== "hero" && hasData(section)
  );

  return (
    <div className="bg-[#F8F5F0]">
      {/* PAGE TITLE (no hero) */}
      {!heroSection && (
        <div className="px-8 md:px-16 pt-4">
          <PageKicker title={data.title} />
          <div className="w-10 h-[2px] bg-[#C9A555] mb-5" />
          <h1 className="font-['Fraunces'] text-4xl md:text-5xl font-medium text-[#2A2623] tracking-tight">
            {data.title}
          </h1>
        </div>
      )}

      {/* HERO */}
      {heroSections.map((section, index) => {
        const hasHeroContent =
          section.heading ||
          section.subheading ||
          section.background?.url ||
          section.buttonText;

        if (!hasHeroContent) return null;

        const hasImage = Boolean(section.background?.url);

        // No background image yet (e.g. still drafting in the CMS) —
        // render as a plain title block on the page background instead
        // of a heavy solid-color banner. This is what was showing up
        // as a jarring "box" with placeholder text.
        if (!hasImage) {
          const alignClass =
            HERO_ALIGN_CLASSES[section.alignment] || HERO_ALIGN_CLASSES.center;

          return (
            <div key={index} className="px-8 md:px-16 pt-4">
              <div className={`flex flex-col ${alignClass}`}>
                <PageKicker title={data.title} />
                <div className="w-10 h-[2px] bg-[#C9A555] mb-5" />
                {section.heading && (
                  <h1 className="font-['Fraunces'] text-4xl md:text-5xl font-medium text-[#2A2623] tracking-tight max-w-3xl">
                    {section.heading}
                  </h1>
                )}
                {section.subheading && (
                  <p
                    className={`mt-5 font-['Inter'] text-base md:text-lg leading-8 max-w-2xl text-[#2A2623]/65 ${
                      section.alignment === "center" ? "mx-auto" : ""
                    }`}
                  >
                    {section.subheading}
                  </p>
                )}
                {section.buttonText && (
                  <a
                    href={section.buttonLink || "#"}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      justify-center
                      mt-8
                      px-8
                      py-3.5
                      font-['Inter']
                      text-sm
                      tracking-wide
                      uppercase
                      border
                      border-[#8A6B3F]
                      text-[#2A2623]
                      hover:bg-[#2A2623]
                      hover:text-[#F8F5F0]
                      hover:border-[#2A2623]
                      transition-colors
                      duration-300
                      w-fit
                    "
                  >
                    {section.buttonText}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                )}
              </div>
            </div>
          );
        }

        // Has a background image — render the full cinematic hero banner.
        const heightClass =
          HERO_HEIGHT_CLASSES[section.height] || HERO_HEIGHT_CLASSES.medium;

        const alignClass =
          HERO_ALIGN_CLASSES[section.alignment] || HERO_ALIGN_CLASSES.center;

        const overlayOpacity = (section.overlay ?? 40) / 100;

        return (
          <section
            key={index}
            className={`relative overflow-hidden -mt-10 md:-mt-16 flex flex-col justify-center ${heightClass}`}
          >
            <img
              src={section.background.url}
              alt={section.background.alt || ""}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: section.backgroundPosition || "center",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg,
                  rgba(20,17,14,${overlayOpacity * 0.5}),
                  rgba(20,17,14,${overlayOpacity * 1}),
                  rgba(20,17,14,${overlayOpacity * 1.6}))`,
              }}
            />

            <div className="relative z-10 flex h-full">
              <div
                className={`
                  w-full
                  max-w-7xl
                  mx-auto
                  flex
                  flex-col
                  justify-center
                  h-full
                  px-8
                  md:px-16
                  lg:px-24
                  py-16
                  ${alignClass}
                `}
              >
                <PageKicker title={data.title} dark />

                <div className="w-12 h-[2px] bg-[#C9A555] mb-6" />

                {section.heading && (
                  <h1 className="font-['Fraunces'] text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight max-w-4xl text-[#F8F5F0]">
                    {section.heading}
                  </h1>
                )}

                {section.subheading && (
                  <p
                    className={`
                      mt-6
                      font-['Inter']
                      text-base
                      md:text-lg
                      leading-8
                      max-w-2xl
                      text-[#F8F5F0]/80
                      ${section.alignment === "center" ? "mx-auto" : ""}
                    `}
                  >
                    {section.subheading}
                  </p>
                )}

                {section.buttonText && (
                  <a
                    href={section.buttonLink || "#"}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      justify-center
                      mt-9
                      px-8
                      py-3.5
                      font-['Inter']
                      text-sm
                      tracking-wide
                      uppercase
                      border
                      border-[#C9A555]
                      text-[#F8F5F0]
                      hover:bg-[#C9A555]
                      hover:text-[#2A2623]
                      transition-colors
                      duration-300
                      w-fit
                    "
                  >
                    {section.buttonText}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <div className="max-w-6xl mx-auto px-8 md:px-16 space-y-20 pb-24">
        {/* EMPTY STATE */}
        {contentSections.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-['Inter'] text-[#2A2623]/40">
              Content will be updated soon.
            </p>
          </div>
        )}

        {/* SECTION RENDERING */}
        {contentSections.map((section, index) => {
          switch (section.type) {
            case "heading":
              return (
                <section key={index}>
                  <div className="w-10 h-[2px] bg-[#C9A555] mb-5" />
                  <h2 className="font-['Fraunces'] text-3xl md:text-4xl font-medium text-[#2A2623] tracking-tight pb-6 border-b border-[#2A2623]/10">
                    {section.text}
                  </h2>
                </section>
              );

            case "richText":
              return (
                <section key={index} className="space-y-6">
                  {section.heading && (
                    <h2 className="font-['Fraunces'] text-3xl font-medium text-[#2A2623] tracking-tight">
                      {section.heading}
                    </h2>
                  )}
                  <div className="whitespace-pre-wrap font-['Inter'] leading-8 text-[#2A2623]/75 text-[17px] max-w-3xl">
                    {section.content}
                  </div>
                </section>
              );

            case "list":
              return (
                <section key={index} className="space-y-6">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <ul className="space-y-4 font-['Inter'] text-[#2A2623]/75">
                    {section.items.map((item, i) => {
                      // Item may arrive as a plain string, {text}, or
                      // (due to how the builder saves it) {text: {text}}
                      // nested one level too deep. Unwrap until we hit a string.
                      let value = item;
                      while (value && typeof value === "object") {
                        value = value.text;
                      }
                      return (
                        <li key={i} className="flex gap-4">
                          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C9A555] shrink-0" />
                          <span className="leading-7">{value ?? ""}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );

            case "timeline":
              return (
                <section key={index} className="space-y-10">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div className="border-l border-[#2A2623]/15 pl-8 space-y-10">
                    {section.events.map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[34px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C9A555] ring-4 ring-[#F8F5F0]" />
                        <h3 className="font-['Fraunces'] font-medium text-lg text-[#2A2623]">
                          {event.year}
                        </h3>
                        <h3 className="mt-2 font-['Fraunces'] text-xl text-[#2A2623]">
                          {event.title}
                        </h3>
                        <p className="mt-3 font-['Inter'] text-[#2A2623]/70 leading-7">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "documentList":
              return (
                <section key={index} className="space-y-6">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div className="divide-y divide-[#2A2623]/10 border-t border-b border-[#2A2623]/10">
                    {section.documents.map((doc, i) => (
                      <div
                        key={i}
                        className="py-5 flex justify-between items-center gap-6"
                      >
                        <div>
                          <h3 className="font-['Inter'] font-medium text-[#2A2623]">
                            {doc.title}
                          </h3>
                          {doc.category && (
                            <p className="text-xs font-['Inter'] uppercase tracking-wide text-[#8A6B3F] mt-1">
                              {doc.category}
                            </p>
                          )}
                          {doc.description && (
                            <p className="text-sm font-['Inter'] text-[#2A2623]/50 mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                        <a
                          href={doc.file}
                          target="_blank"
                          rel="noreferrer"
                          className="font-['Inter'] text-sm uppercase tracking-wide text-[#8A6B3F] hover:text-[#C9A555] whitespace-nowrap transition-colors"
                        >
                          Open →
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "eventList":
              return (
                <section key={index} className="space-y-6">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div className="space-y-5">
                    {section.events.map((event, i) => (
                      <div
                        key={i}
                        className="border border-[#2A2623]/10 bg-white/40 p-6"
                      >
                        <h3 className="font-['Fraunces'] text-xl font-medium text-[#2A2623]">
                          {event.title}
                        </h3>
                        {event.date && (
                          <p className="text-sm font-['Inter'] uppercase tracking-wide text-[#8A6B3F] mt-2">
                            {event.date}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-4 font-['Inter'] text-[#2A2623]/70 leading-7">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "gallery":
              return (
                <section key={index} className="space-y-8">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div
                    className={`
                      grid gap-6
                      ${
                        section.columns === 2
                          ? "grid-cols-1 md:grid-cols-2"
                          : section.columns === 4
                          ? "grid-cols-2 lg:grid-cols-4"
                          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      }
                    `}
                  >
                    {(section.images || []).map((image, i) => (
                      <div key={i} className="group">
                        <div className="aspect-[4/3] bg-[#2A2623]/5 overflow-hidden">
                          {image.image ? (
                            <img
                              src={image.image}
                              alt={image.alt || ""}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-[#2A2623]/30 font-['Inter'] text-sm">
                              No Image
                            </div>
                          )}
                        </div>
                        {(image.caption || image.alt) && (
                          <div className="pt-3">
                            {image.caption && (
                              <h3 className="font-['Inter'] font-medium text-sm text-[#2A2623]">
                                {image.caption}
                              </h3>
                            )}
                            {image.alt && (
                              <p className="text-sm font-['Inter'] text-[#2A2623]/50 mt-1">
                                {image.alt}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "faculty-grid":
              return (
                <section key={index} className="space-y-14">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-3xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  {(section.departments || []).map((department, departmentIndex) => (
                    <div
                      key={department.id || departmentIndex}
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-4 border-b border-[#2A2623]/10 pb-3">
                        <span className="w-6 h-[2px] bg-[#C9A555]" />
                        <h3 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                          {department.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {(department.members || []).map((member, memberIndex) => (
                          <Card
                            key={member.id || memberIndex}
                            item={member}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );

            case "table":
              return (
                <section key={index} className="space-y-6">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div className="overflow-x-auto border border-[#2A2623]/10">
                    <table className="min-w-full border-collapse font-['Inter']">
                      <thead className="bg-[#2A2623] text-[#F8F5F0]">
                        <tr>
                          {(section.headers || []).map((header, i) => (
                            <th
                              key={i}
                              className="px-6 py-4 text-left text-sm uppercase tracking-wide font-medium"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2623]/10">
                        {(section.rows || []).map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-[#8A6B3F]/[0.04] transition-colors"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 text-[#2A2623]/75"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );

            case "embed":
              return (
                <section key={index} className="space-y-6">
                  {section.title && (
                    <h2 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                      {section.title}
                    </h2>
                  )}
                  <div className="overflow-hidden border border-[#2A2623]/10">
                    <iframe
                      src={section.url}
                      title={section.title || "Embedded Content"}
                      width={section.responsive ? "100%" : section.width || "100%"}
                      height={section.height || 500}
                      loading={section.lazyLoad ? "lazy" : "eager"}
                      allowFullScreen={section.allowFullscreen}
                      className="border-0 w-full"
                    />
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default PageTemplate;