import { useEffect, useState } from "react";
import { getCleanImageUrl } from "../../utils/imageUrl";
import {
  Calendar,
  FileText,
  Users,
  Download,
  Clock,
  MapPin,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Globe,
  Building,
  Mail,
  Phone,
  Layers,
  FileCheck,
  FileDown,
  Star,
  Shield,
  Bookmark,
  BadgeCheck,
  Briefcase,
} from "lucide-react";

const ICON_MAP = {
  calendar: Calendar,
  filetext: FileText,
  document: FileText,
  users: Users,
  people: Users,
  download: Download,
  filedown: FileDown || Download,
  clock: Clock,
  duration: Clock,
  time: Clock,
  mappin: MapPin,
  location: MapPin,
  award: Award,
  bookopen: BookOpen,
  curriculum: BookOpen,
  graduationcap: GraduationCap,
  graduation: GraduationCap,
  sparkles: Sparkles,
  checkcircle: CheckCircle,
  globe: Globe,
  building: Building,
  mail: Mail,
  phone: Phone,
  layers: Layers,
  filecheck: FileCheck,
  star: Star,
  shield: Shield,
  bookmark: Bookmark,
  badgecheck: BadgeCheck,
  briefcase: Briefcase,
};

const DynamicHeroIcon = ({ name, className, size = 26 }) => {
  const key = (name || "").toLowerCase().replace(/[^a-z]/g, "");
  const IconComponent = ICON_MAP[key] || Calendar;
  return <IconComponent size={size} strokeWidth={1.4} className={className} />;
};

const HeroSection = ({ section = {}, pageTitle = "" }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const hasImage = Boolean(section.background?.url);
  const alignment = section.alignment || "left"; // "left" | "center" | "right"

  // User content - NO hardcoded fake placeholders
  const headingText = section.heading || pageTitle || "";
  const subheadingText = section.subheading || "";
  const eyebrowText = section.eyebrow || section.kicker || "";

  // Quick info items - only render what the user actually configures, NO forced dummy items
  const quickInfoItems = Array.isArray(section.quickInfo) && section.quickInfo.length > 0
    ? section.quickInfo
    : Array.isArray(section.highlights) && section.highlights.length > 0
    ? section.highlights
    : Array.isArray(section.stats) && section.stats.length > 0
    ? section.stats
    : [];

  // Watermark Motto (shown on left alignment if enabled)
  const showWatermark = section.showWatermark !== false && alignment === "left";
  const taglineRaw = section.watermarkTagline || "LEARN\nGROW\nBELONG";
  const mottoLines = taglineRaw.split("\n").filter(Boolean);

  if (!headingText && !subheadingText && !eyebrowText && quickInfoItems.length === 0) {
    return null;
  }

  const revealClass = `
    transition-all
    duration-700
    ease-out
    ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
  `;

  return (
    <div className="w-full">
      {/* ---------------- Main Hero Banner Card ---------------- */}
      <section
        className={`
          relative
          isolate
          overflow-hidden
          rounded-none
          border
          border-[#2b2b2b]
          bg-[#171717]
          text-white
          p-[35px_25px]
          sm:p-[50px_45px]
          md:p-[80px_90px]
          min-h-[500px]
          md:min-h-[520px]
          flex
          flex-col
          justify-between
          shadow-2xl
        `}
      >
        {/* ---------------- Background Image (if configured) ---------------- */}
        {hasImage && (
          <>
            <img
              src={getCleanImageUrl(section.background.url)}
              alt={section.background.alt || ""}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: "center",
                opacity: (100 - (section.overlay ?? 50)) / 100,
              }}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = "true";
                  e.currentTarget.src = "/uploads/hero1.jpg";
                }
              }}
            />
            <div
              className="absolute inset-0 bg-[#171717]/85 pointer-events-none"
            />
          </>
        )}

        {/* ---------------- Main Top/Middle Content ---------------- */}
        <div className={`relative z-10 w-full ${revealClass}`}>
          <div
            className={`
              flex
              items-start
              justify-between
              gap-8
              ${alignment === "center" ? "flex-col items-center text-center" : alignment === "right" ? "flex-row-reverse" : "flex-row"}
            `}
          >
            {/* Main Content Area */}
            <div
              className={`
                flex-1
                min-w-0
                ${alignment === "center" ? "flex flex-col items-center text-center mx-auto" : alignment === "right" ? "flex flex-col items-end text-right" : "flex flex-col items-start text-left"}
              `}
            >
              {/* ---------- Eyebrow with Gold Accent Rule ---------- */}
              {eyebrowText && (
                <div
                  className={`
                    flex
                    items-center
                    gap-3.5
                    mb-4
                    sm:mb-5
                    ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}
                  `}
                >
                  {alignment === "center" && (
                    <span className="h-[1px] w-10 bg-[#C5A880] shrink-0 opacity-90" />
                  )}
                  {alignment === "right" && (
                    <span className="h-[1px] w-12 bg-[#C5A880] shrink-0 opacity-90" />
                  )}

                  <span className="font-['Inter',_sans-serif] text-[12px] font-medium tracking-[0.16em] uppercase text-[#C5A880]">
                    {eyebrowText}
                  </span>

                  {alignment !== "right" && (
                    <span className="h-[1px] w-12 bg-[#C5A880] shrink-0 opacity-90" />
                  )}
                </div>
              )}

              {/* ---------- Heading (Course Detail Serif Style) ---------- */}
              {headingText && (
                <h1
                  className={`
                    font-['Playfair_Display',_serif]
                    text-[clamp(44px,6.5vw,86px)]
                    font-normal
                    leading-[0.96]
                    tracking-[-0.04em]
                    text-white
                    ${alignment === "center" ? "max-w-[1050px]" : "max-w-[1050px]"}
                  `}
                >
                  {headingText}
                </h1>
              )}

              {/* ---------- Subtitle / Description ---------- */}
              {subheadingText && (
                <p
                  className={`
                    mt-[26px]
                    font-['Inter',_sans-serif]
                    text-[16px]
                    md:text-[17px]
                    leading-relaxed
                    text-[#BDBDBD]
                    ${alignment === "center" ? "max-w-[720px] text-center mx-auto" : alignment === "right" ? "max-w-[720px] text-right" : "max-w-[720px] text-left"}
                  `}
                >
                  {subheadingText}
                </p>
              )}

              {/* ---------- CTA Buttons (if configured) ---------- */}
              {(section.primaryButtonText || section.secondaryButtonText) && (
                <div
                  className={`
                    mt-8
                    flex
                    flex-wrap
                    items-center
                    gap-4
                    ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}
                  `}
                >
                  {section.primaryButtonText && (
                    <a
                      href={section.primaryButtonLink || "#"}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-none
                        bg-[#C5A880]
                        px-7
                        py-3
                        font-['Inter']
                        text-xs
                        font-semibold
                        tracking-wider
                        uppercase
                        text-[#171717]
                        transition-all
                        duration-300
                        hover:bg-[#d6bca0]
                      "
                    >
                      {section.primaryButtonText}
                    </a>
                  )}

                  {section.secondaryButtonText && (
                    <a
                      href={section.secondaryButtonLink || "#"}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-none
                        border
                        border-white/30
                        px-7
                        py-3
                        font-['Inter']
                        text-xs
                        font-semibold
                        tracking-wider
                        uppercase
                        text-white
                        transition-all
                        duration-300
                        hover:bg-white
                        hover:text-black
                      "
                    >
                      {section.secondaryButtonText}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ---------- Right Column: Motto (Left Alignment Mode) ---------- */}
            {showWatermark && mottoLines.length > 0 && (
              <div className="hidden lg:flex items-center shrink-0 select-none pl-6 pr-2 pt-2">
                {/* Vertical Motto Column */}
                <div className="flex flex-col text-[10px] tracking-[0.28em] text-[#707070] font-['Inter'] font-medium uppercase space-y-1.5 pl-1">
                  {mottoLines.map((line, idx) => (
                    <span key={idx}>{line}</span>
                  ))}
                  <span className="w-4 h-[1.5px] bg-[#8E7245] mt-1 opacity-80" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- Horizontal Divider & Quick Info Strip (Matching Course Detail Meta) ---------------- */}
        {quickInfoItems.length > 0 && (
          <div className="relative z-10 mt-12 md:mt-[60px] pt-7 md:pt-[30px] border-t border-[#3a3a3a]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
              {quickInfoItems.map((item, idx) => {
                const isNotLast = idx < quickInfoItems.length - 1;
                return (
                  <div
                    key={idx}
                    className={`
                      flex
                      items-center
                      gap-4
                      ${isNotLast ? "lg:border-r lg:border-[#2f2f2f] lg:pr-6" : ""}
                    `}
                  >
                    {/* Outline Icon in Gold */}
                    <div className="shrink-0 text-[#C5A880]">
                      <DynamicHeroIcon name={item.icon} size={26} />
                    </div>

                    {/* Metadata Label & Value */}
                    <div className="min-w-0">
                      <span className="block font-['Inter',_sans-serif] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8e8e8e] mb-1">
                        {item.label}
                      </span>
                      <span className="block font-['Inter',_sans-serif] text-[15px] font-medium text-[#f0f0f0] leading-snug">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HeroSection;