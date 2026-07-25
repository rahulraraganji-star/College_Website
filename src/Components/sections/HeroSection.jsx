import { useEffect, useState } from "react";
import PageKicker from "./PageKicker";

const HERO_HEIGHT_CLASSES = {
  small: "min-h-[42vh]",
  medium: "min-h-[56vh]",
  large: "min-h-[68vh]",
  fullscreen: "min-h-screen",
};

const HeroSection = ({ section, pageTitle }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const hasContent = section.heading || section.subheading;

  if (!hasContent) return null;

  const hasImage = Boolean(section.background?.url);

  const heightClass =
    HERO_HEIGHT_CLASSES[section.height] ?? HERO_HEIGHT_CLASSES.medium;

  const revealClass = `
    transition-all
    duration-1000
    ease-out
    ${
      loaded
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }
  `;

  return (
    <section
      className={`
        relative
        isolate
        overflow-hidden
        ${heightClass}
      `}
      style={
        hasImage
          ? undefined
          : {
              background:
                "linear-gradient(180deg,#25211D 0%,#1A1816 100%)",
            }
      }
    >
      {/* ---------------- Background Image ---------------- */}
      {hasImage && (
        <img
          src={section.background.url}
          alt={section.background.alt || ""}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            scale-105
          "
         style={{
  objectPosition: "center",
}}
        />
      )}

      {/* ---------------- Main Editorial Overlay ---------------- */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(18,18,18,.55) 0%,
              rgba(20,20,20,.70) 45%,
              rgba(14,14,14,.88) 100%
            )
          `,
        }}
      />

      {/* ---------------- Vignette ---------------- */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 180px rgba(0,0,0,.45)",
        }}
      />

      {/* ---------------- Editorial Grid ---------------- */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
          `,
          backgroundSize: "96px 96px",
        }}
      />

      {/* ---------------- Top Noise Gradient ---------------- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,255,255,.08), transparent 55%)",
        }}
      />

      {/* ---------------- Corner Accent ---------------- */}
      <div className="absolute top-8 left-8 h-8 w-8 border-l border-t border-white/20" />

      {/* ---------------- Main Content ---------------- */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div
          className={`
            mx-auto
            flex
            w-full
            max-w-[1700px]
            flex-col
            items-center
            justify-center
            px-6
            text-center
            lg:px-10
            ${revealClass}
          `}
        >
          {/* ---------- Page Kicker ---------- */}
          <PageKicker title={pageTitle} dark />

          {/* ---------- Gold Divider ---------- */}
          <div className="mt-4 mb-6 h-[2px] w-16 rounded-full bg-[#C9A555]" />

          {/* ---------- Heading ---------- */}
          {section.heading && (
            <h1
              className="
                max-w-5xl
                font-['Fraunces']
                text-[40px]
                font-medium
                italic
                leading-[0.95]
                tracking-[-0.04em]
                text-[#F8F5F0]
                md:text-[56px]
                lg:text-[64px]
                xl:text-[72px]
              "
              style={{
                textShadow: "0 12px 40px rgba(0,0,0,.35)",
              }}
            >
              {section.heading}
            </h1>
          )}

          {/* ---------- Description ---------- */}
          {section.subheading && (
            <p
              className="
                mt-6
                max-w-2xl
                font-['Inter']
                text-[16px]
                font-normal
                leading-8
                text-white/75
                md:text-[18px]
              "
            >
              {section.subheading}
            </p>
          )}

{/* ---------- CTA Buttons ---------- */}

{(section.primaryButtonText || section.secondaryButtonText) && (

  <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

    {section.primaryButtonText && (

      <a
        href={section.primaryButtonLink || "#"}
        className="
          inline-flex
          items-center
          justify-center
          rounded-full
          bg-[#C9A555]
          px-7
          py-3
          font-['Inter']
          text-sm
          font-semibold
          text-white
          transition-all
          duration-300
          hover:bg-[#B7923E]
          hover:-translate-y-0.5
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
          rounded-full
          border
          border-white/40
          px-7
          py-3
          font-['Inter']
          text-sm
          font-semibold
          text-white
          transition-all
          duration-300
          hover:bg-white
          hover:text-[#1E1E1E]
        "
      >
        {section.secondaryButtonText}
      </a>

    )}

  </div>

)}
          

          {/* ---------- Bottom Divider ---------- */}
          <div className="mt-10 h-px w-full max-w-md bg-white/15" />

          {/* ---------- Scroll Indicator ---------- */}
          <div className="mt-6 flex flex-col items-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-white/40"
            >
              <path
                d="M3 6L9 12L15 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ---------------- Bottom Hairline ---------------- */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/10" />
    </section>
  );
};

export default HeroSection;