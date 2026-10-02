import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import AccessibilityAudioReader from "./AccessibilityAudioReader";

const renderMobileTitle = (title) => {
  if (!title || typeof title !== "string") return title;

  if (title.includes("\n")) {
    return title.split("\n").map((line, idx) => (
      <span key={idx} className="block whitespace-nowrap">
        {line}
      </span>
    ));
  }

  const collegeMatch = title.match(/^(.*?\bCollege\s+of)\s+(.*)$/i);
  if (collegeMatch) {
    return (
      <>
        <span className="block whitespace-nowrap">{collegeMatch[1]}</span>
        <span className="block whitespace-nowrap">{collegeMatch[2]}</span>
      </>
    );
  }

  return title;
};

const Header = ({ data }) => {
  if (!data) return null;

  return (
    <header className="w-full bg-[#FAF8F5] border-b border-[#E8E1D5] relative">
      {/* Accessibility Toolbar (Bottom Right) - Desktop view only */}
      <div className="hidden lg:block absolute bottom-3.5 right-6 lg:right-8 z-30">
        <AccessibilityAudioReader />
      </div>

      {/* Mobile Header - visible only on mobile */}
      <div className="md:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-start gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center -translate-y-2">
              <img
                src={data.logo || logo}
                alt="College Logo"
                fetchPriority="high"
                loading="eager"
                className="w-[74px] sm:w-[80px] h-auto object-contain"
              />
            </Link>

            {/* Text Content */}
            <div className="flex-1 text-left min-w-0">
              {/* College Name */}
              <h1
                className="
                  text-[#233044]
                  text-[clamp(1.35rem,6.2vw,2rem)]
                  leading-[1.12]
                  tracking-[-0.02em]
                  font-normal
                  font-[Jaini_Purva]
                "
              >
                {renderMobileTitle(data.title)}
              </h1>

              {/* Subtitle */}
              {data.subtitle && (
                <p
                  className="
                    mt-2
                    text-[#C8921B]
                    text-[18px]
                    font-semibold
                    tracking-[0.08em]
                  "
                >
                  {data.subtitle}
                </p>
              )}

              {/* Tagline */}
              {data.tagline && (
                <p
                  className="
                    mt-1.5
                    text-[#7C8493]
                    text-[12px]
                    tracking-[0.08em]
                    uppercase
                    font-normal
                  "
                >
                  {data.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Subtle divider - mobile only */}
        <div className="border-b border-[#E6DCCB]" />
      </div>

      {/* Desktop Header - exactly as it was, unchanged */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-center gap-5 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center -translate-y-1.5 md:-translate-y-2">
              <img
                src={data.logo || logo}
                alt="College Logo"
                fetchPriority="high"
                loading="eager"
                className="w-20 md:w-24 lg:w-[100px] h-auto object-contain"
              />
            </Link>

            {/* Text Content */}
            <div className="text-center">
              {/* College Name */}
              <h1
                className="
                  text-[#233044]
                  text-2xl
                  md:text-[3.2rem]
                  leading-none
                  tracking-wide
                  font-normal
                  font-[Jaini_Purva]
                "
              >
                {data.title}
              </h1>

              {/* Subtitle */}
              {data.subtitle && (
                <p
                  className="
                    mt-2
                    text-[#9A7B4F]
                    md:text-[19px]
                    text-sm
                    md:text-base
                    tracking-[0.08em]
                    font-medium
                  "
                >
                  {data.subtitle}
                </p>
              )}

              {/* Tagline */}
              {data.tagline && (
                <p
                  className="
                    mt-1.5
                    text-[#6B7280]
                    text-[10px]
                    md:text-[12px]
                    uppercase
                    tracking-[0.22em]
                    font-normal
                  "
                >
                  {data.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;