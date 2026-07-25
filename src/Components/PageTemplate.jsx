import { NavLink } from "react-router-dom";

import HeroSection from "./sections/HeroSection";
import PageKicker from "./sections/PageKicker";
import ContentSection from "./sections/ContentSection";
import ListSection from "./sections/ListSection";
import TimelineSection from "./sections/TimelineSection";
import FacultySection from "./sections/FacultySection";
import GallerySection from "./sections/GallerySection";
import DocumentsSection from "./sections/DocumentsSection";
import EventListSection from "./sections/EventListSection";
import TableSection from "./sections/TableSection";
import EmbedSection from "./sections/EmbedSection";

const hasData = (section) => {
  switch (section.type) {
    case "hero": return true;
    case "heading": return Boolean(section.text?.trim());
    case "richText": return Boolean(section.content?.trim());
    case "list": return Array.isArray(section.items) && section.items.length > 0;
    case "timeline": return Array.isArray(section.events) && section.events.length > 0;
    case "faculty-grid": return Array.isArray(section.departments) && section.departments.length > 0;
    case "gallery": return Array.isArray(section.images) && section.images.length > 0;
    case "table": return Array.isArray(section.rows) && section.rows.length > 0;
    case "documentList": return Array.isArray(section.documents) && section.documents.length > 0;
    case "eventList": return Array.isArray(section.events) && section.events.length > 0;
    case "embed": return Boolean(section.url);
    default: return false;
  }
};

const buildEditorialGroups = (sections) => {
  const groups = [];
  let i = 0;

  while (i < sections.length) {
    const section = sections[i];

    if (section.type === "heading") {
      const blocks = [];
      let j = i + 1;

      while (j < sections.length && sections[j].type === "richText") {
        blocks.push(sections[j]);
        j++;
      }

      if (section.text || blocks.length > 0) {
        groups.push({
          kind: "content",
          heading: section.text || "",
          blocks,
        });
      }

      i = j;
    } else if (section.type === "richText") {
      groups.push({
        kind: "content",
        heading: section.heading || "",
        blocks: [section],
      });
      i++;
    } else {
      groups.push({
        kind: section.type,
        section,
      });
      i++;
    }
  }

  return groups;
};

const PageTemplate = ({
  data,
  navItems = [],
}) => {
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
  const heroSection = safeSections.find((section) => section.type === "hero");
  const remainingSections = safeSections.filter(
    (section) => section.type !== "hero" && hasData(section)
  );
  const groups = buildEditorialGroups(remainingSections);
  const isEmpty = !heroSection && groups.length === 0;

  const renderSidebar = () => {
  

    return (
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <p className="mb-8 font-['Inter'] text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6B3F]">
            On this page
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center border-l-2 py-3 pl-6 transition-all duration-300 ${
                    isActive ? "border-[#C9A555]" : "border-[#E6DED3] hover:border-[#C9A555]/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <span
                    className={`font-['Inter'] text-[17px] leading-snug transition-all duration-300 ${
                      isActive
                        ? "font-semibold text-[#2A2623] translate-x-0.5"
                        : "font-medium text-[#2A2623]/70 group-hover:text-[#2A2623] group-hover:translate-x-0.5"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    );
  };

  const renderContent = () => (
    <div className="space-y-12">
      {groups.map((group, index) => {
        switch (group.kind) {
          case "content": return <ContentSection key={index} heading={group.heading} blocks={group.blocks} />;
          case "list": return <ListSection key={index} section={group.section} />;
          case "timeline": return <TimelineSection key={index} section={group.section} />;
          case "faculty-grid": return <FacultySection key={index} section={group.section} />;
          case "gallery": return <GallerySection key={index} section={group.section} />;
          case "documentList": return <DocumentsSection key={index} section={group.section} />;
          case "eventList": return <EventListSection key={index} section={group.section} />;
          case "table": return <TableSection key={index} section={group.section} />;
          case "embed": return <EmbedSection key={index} section={group.section} />;
          default: return null;
        }
      })}
    </div>
  );

  


  return (
    <div className="bg-[#F8F5F0] min-h-screen">
      {/* HERO SECTION */}
      {!heroSection ? (
        <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-12">
          <PageKicker title={data.title} />
          <div className="mt-5 mb-6 w-12 h-[2px] bg-[#C9A555]" />
          <h1 className="font-['Fraunces'] text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-[#2A2623]">
            {data.title}
          </h1>
        </section>
      ) : (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-10 md:pt-12">
          <HeroSection section={heroSection} pageTitle={data.title} />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-14 xl:gap-20">

          {renderSidebar()}

          {isEmpty ? (
            <div className="py-24 text-center">
              <p className="font-['Inter'] text-[#2A2623]/45">
                Content will be updated soon.
              </p>
            </div>
          ) : (
            renderContent()
          )}

        </div>
      </main>
    </div>
  );
};

export default PageTemplate;