import { useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { prefetchPage } from "../utils/pageCache";
import {
  ChevronRight,
  ChevronDown,
  Compass,
  ArrowUp,
  GraduationCap
} from "lucide-react";

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
import OrganogramSection from "./sections/OrganogramSection";
import NoticesSection from "./NoticesSection";

const hasData = (section) => {
  switch (section.type) {
    case "hero": return true;
    case "organogram": return true;
    case "heading": return Boolean(section.text?.trim());
    case "richText": return Boolean(section.content?.trim());
    case "list": return Array.isArray(section.items) && section.items.length > 0;
    case "timeline": return Array.isArray(section.events) && section.events.length > 0;
    case "faculty-grid": return Array.isArray(section.departments) && section.departments.length > 0;
    case "gallery":
      return (
        Array.isArray(section.galleries) &&
        section.galleries.some(
          (gallery) =>
            (gallery.type === "principalMessage" &&
              (gallery.message || gallery.name || gallery.media || gallery.title)) ||
            (Array.isArray(gallery.images) && gallery.images.length > 0)
        )
      );
    case "table": return Array.isArray(section.rows) && section.rows.length > 0;
    case "documentList": return Array.isArray(section.documents) && section.documents.length > 0;
    case "eventList": return Array.isArray(section.events) && section.events.length > 0;
    case "embed":
      return Boolean(
        section.url ||
        (Array.isArray(section.links) && section.links.some((l) => Boolean(l?.url)))
      );
    case "notices": return Array.isArray(section.notices) && section.notices.length > 0;
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

// Format slug into clean title for breadcrumb
const formatSlugName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const PageTemplate = ({
  data,
  navItems = [],
}) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const safeSections = useMemo(
    () => (Array.isArray(data?.sections) ? data.sections : []),
    [data]
  );
  const heroSection = useMemo(
    () => safeSections.find((section) => section.type === "hero"),
    [safeSections]
  );
  const remainingSections = useMemo(
    () => safeSections.filter((section) => section.type !== "hero" && hasData(section)),
    [safeSections]
  );
  const groups = useMemo(
    () => buildEditorialGroups(remainingSections),
    [remainingSections]
  );
  const isEmpty = !heroSection && groups.length === 0;

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[#F8F5F0]">
        <div className="text-center p-8 rounded-2xl bg-white/60 border border-[#E6DED3] max-w-md">
          <GraduationCap className="mx-auto text-[#8A6B3F] mb-3" size={36} />
          <p className="font-['Fraunces'] text-xl font-medium text-[#2A2623] mb-1">
            Content Unavailable
          </p>
          <p className="font-['Inter'] text-sm text-[#7A7268]">
            The requested page content could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Breadcrumbs calculation
  const pathParts = location.pathname.split("/").filter(Boolean);
  const parentSlug = pathParts.length > 1 ? pathParts[0] : "";
  const currentTitle = data.title || formatSlugName(pathParts[pathParts.length - 1]);

  // Check if current view is a staff or faculty directory page
  const isStaffPage = Boolean(
    parentSlug === "staff" ||
    data?.parentSlug === "staff" ||
    location.pathname.startsWith("/staff") ||
    data?.slug?.startsWith("staff") ||
    data?.slug?.includes("faculty") ||
    data?.sections?.some((s) => s.type === "faculty-grid")
  );

  const hasSidebar = !isStaffPage && Boolean(navItems && navItems.length > 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =====================================================
     DESKTOP SIDEBAR ("ON THIS PAGE") - ELEGANT & PROFESSIONAL
  ====================================================== */
  const renderDesktopSidebar = () => {
    if (!hasSidebar) return null;

    return (
      <aside className="hidden lg:block w-[250px] shrink-0">
        <div className="sticky top-28">
          <p className="mb-6 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6B3F]">
            On This Page
          </p>

          <nav className="flex flex-col border-l-2 border-[#E6DED3]" aria-label="Section Navigation">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.to || idx}
                to={item.to}
                onMouseEnter={() => {
                  const parts = (item.to || "").split("/").filter(Boolean);
                  const itemSlug = parts.pop();
                  if (itemSlug) prefetchPage(itemSlug);
                }}
                className={({ isActive }) =>
                  `group relative flex items-center py-3 pl-6 pr-3 -ml-[2px] border-l-2 transition-all duration-200 ${
                    isActive
                      ? "border-[#C9A555] text-[#2A2623] font-semibold bg-gradient-to-r from-[#C9A555]/10 via-[#C9A555]/5 to-transparent rounded-r-lg"
                      : "border-transparent text-[#2A2623]/70 hover:text-[#2A2623] hover:border-[#C9A555]/50 hover:bg-black/[0.02] rounded-r-lg font-medium"
                  }`
                }
              >
                {({ isActive }) => (
                  <span
                    className={`font-['Inter'] text-[16px] leading-snug transition-transform duration-200 ${
                      isActive ? "translate-x-0.5" : "group-hover:translate-x-0.5"
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

  /* =====================================================
     MOBILE / TABLET STICKY SUBNAV (< lg)
  ====================================================== */
  const renderMobileSubNav = () => {
    if (!hasSidebar) return null;

    return (
      <div className="lg:hidden mb-8">
        <div className="rounded-xl bg-white border border-[#E6DED3] shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 text-left bg-white transition-colors hover:bg-[#F8F5F0]"
            aria-expanded={mobileNavOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#C9A555]" />
              <div className="min-w-0">
                <span className="block font-['IBM_Plex_Mono'] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A6B3F]">
                  Explore This Section
                </span>
                <span className="block font-['Inter'] text-sm font-medium text-[#2A2623] truncate">
                  {currentTitle}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8A6B3F] font-medium shrink-0 ml-3">
              <span>{mobileNavOpen ? "Close" : "Menu"}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  mobileNavOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Collapsible Dropdown */}
          {mobileNavOpen && (
            <div className="p-3 border-t border-[#E6DED3] bg-[#FBF9F5] divide-y divide-[#E6DED3]/60">
              {navItems.map((item, idx) => (
                <NavLink
                  key={item.to || idx}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-[#8A6B3F]/10 text-[#2A2623] font-semibold"
                        : "text-[#5C554C] hover:text-[#2A2623] hover:bg-white"
                    }`
                  }
                >
                  <span className="font-['Inter'] text-[14px] truncate">{item.label}</span>
                  <ChevronRight size={14} className="text-[#8A6B3F]/60" />
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* =====================================================
     CONTENT RENDERER
  ====================================================== */
  const renderContent = () => (
    <div className="space-y-12 sm:space-y-16 min-w-0 w-full">
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
          case "organogram": return <OrganogramSection key={index} section={group.section} />;
          case "notices": return <NoticesSection key={index} data={group.section} />;
          default: return null;
        }
      })}

      {/* Back to top button */}
      <div className="pt-8 flex justify-center">
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#E6DED3] text-xs font-['IBM_Plex_Mono'] font-medium uppercase tracking-wider text-[#7A7268] hover:text-[#2A2623] hover:border-[#C9A555] transition-all shadow-sm"
        >
          <ArrowUp size={13} />
          <span>Back to Top</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F5F0] min-h-screen">
      {/* =====================================================
          HEADER / HERO SECTION
      ====================================================== */}
      {!heroSection ? (
        <header className="border-b border-[#E6DED3]/80 bg-[#FAF8F5]/80">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pt-8 pb-10">
            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] uppercase tracking-wider text-[#7A7268] mb-6 overflow-x-auto">
              <Link to="/" className="hover:text-[#2A2623] transition-colors">
                Home
              </Link>
              {parentSlug && (
                <>
                  <ChevronRight size={12} className="text-[#8A6B3F]/60 shrink-0" />
                  <span className="text-[#8A6B3F] font-semibold">
                    {formatSlugName(parentSlug)}
                  </span>
                </>
              )}
              <ChevronRight size={12} className="text-[#8A6B3F]/60 shrink-0" />
              <span className="text-[#2A2623] font-semibold truncate max-w-[200px] sm:max-w-none">
                {currentTitle}
              </span>
            </nav>

            <PageKicker title={data.title} />

            <div className="mt-3 mb-5 w-12 h-[2px] bg-[#C9A555] rounded-full" />

            <h1 className="font-['Fraunces'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.12] text-[#2A2623]">
              {data.title}
            </h1>
          </div>
        </header>
      ) : (
        <div className="w-[min(1360px,calc(100%-48px))] mx-auto pt-6 md:pt-8">
          <HeroSection section={heroSection} pageTitle={data.title} parentSlug={parentSlug} />
        </div>
      )}

      {/* =====================================================
          MAIN EDITORIAL CONTENT
      ====================================================== */}
      <main
        className={`mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16 ${
          isStaffPage ? "max-w-[1440px]" : "max-w-[1440px]"
        }`}
      >
        {/* Mobile Navigation Dropdown (< lg) */}
        {renderMobileSubNav()}

        {hasSidebar ? (
          <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-8 xl:gap-10 items-start">
            {/* Desktop Left Sidebar */}
            {renderDesktopSidebar()}

            {/* Main Right Content */}
            <div className="min-w-0 w-full">
              {isEmpty ? (
                <div className="py-20 text-center rounded-2xl bg-white/50 border border-[#E6DED3] p-8">
                  <Compass className="mx-auto text-[#8A6B3F] mb-3" size={36} />
                  <p className="font-['Fraunces'] text-xl font-medium text-[#2A2623] mb-1">
                    Content Coming Soon
                  </p>
                  <p className="font-['Inter'] text-sm text-[#7A7268]">
                    This section is being updated with official academic information.
                  </p>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        ) : (
          <div className="w-full min-w-0">
            {isEmpty ? (
              <div className="py-20 text-center rounded-2xl bg-white/50 border border-[#E6DED3] p-8">
                <Compass className="mx-auto text-[#8A6B3F] mb-3" size={36} />
                <p className="font-['Fraunces'] text-xl font-medium text-[#2A2623] mb-1">
                  Content Coming Soon
                </p>
                <p className="font-['Inter'] text-sm text-[#7A7268]">
                  This section is being updated with official academic information.
                </p>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PageTemplate;