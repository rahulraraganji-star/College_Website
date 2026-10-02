import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCleanImageUrl } from "../utils/imageUrl";

const Hero = ({ data }) => {
  const slides = data?.slides || [];

  const [activeIndex, setActiveIndex] = useState(0);

  const imageRefs = useRef([]);
  const contentRef = useRef(null);
  const isAnimating = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const AUTOPLAY_INTERVAL = 6500;

  const setImageRef = (el, i) => {
    imageRefs.current[i] = el;
  };

  // CAROUSEL TRANSITION — smooth crossfade only
  const changeSlide = (nextIndex) => {
    if (isAnimating.current) return;

    const current = imageRefs.current[activeIndexRef.current];
    const next = imageRefs.current[nextIndex];

    if (!current || !next || current === next) return;

    isAnimating.current = true;

    gsap.set(next, { zIndex: 2, opacity: 0 });
    gsap.set(current, { zIndex: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(current, { opacity: 0, zIndex: 0 });
        gsap.set(next, { zIndex: 2, opacity: 1 });
        setActiveIndex(nextIndex);
        isAnimating.current = false;
      },
    });

    // IMAGE CROSSFADE — smooth, single easing, no scale/rotate/zoom
    tl.to(
      next,
      {
        opacity: 1,
        duration: 2,
        ease: "power2.inOut",
      },
      0
    ).to(
      current,
      {
        opacity: 0,
        duration: 2,
        ease: "power2.inOut",
      },
      0
    );

    // TEXT — only the elements marked .hero-item change with the image
    // (title and button are intentionally excluded so they stay put)
    tl.to(
      contentRef.current?.querySelectorAll(".hero-item"),
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
      },
      0
    ).to(
      contentRef.current?.querySelectorAll(".hero-item"),
      {
        opacity: 1,
        duration: 0.9,
        ease: "power1.out",
      },
      0.55
    );
  };

  const handlePrev = () => {
    if (slides.length <= 1 || isAnimating.current) return;
    const prev = (activeIndexRef.current - 1 + slides.length) % slides.length;
    changeSlide(prev);
  };

  const handleNext = () => {
    if (slides.length <= 1 || isAnimating.current) return;
    const next = (activeIndexRef.current + 1) % slides.length;
    changeSlide(next);
  };

  const changeSlideRef = useRef(changeSlide);
  useEffect(() => {
    changeSlideRef.current = changeSlide;
  });

  // INITIAL LOAD
  useEffect(() => {
    if (!slides.length) return;

    gsap.set(imageRefs.current[0], {
      opacity: 1,
      zIndex: 2,
    });

    gsap.fromTo(
      contentRef.current?.querySelectorAll(".hero-item"),
      {
        y: 60,
        opacity: 0,
        filter: "blur(10px)",
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: 1.2,
        ease: "power4.out",
      }
    );
  }, [slides.length]);

  // AUTO SLIDE
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      const next = (activeIndex + 1) % slides.length;
      changeSlideRef.current(next);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex, slides.length]);

  if (!slides.length) return null;

  const currentSlide = slides[activeIndex];

  const title = data.heading || "Empowering Minds. Building Futures";

  const dotIndex = title.indexOf(".");

  const titleLine1 =
    dotIndex !== -1 ? title.slice(0, dotIndex + 1) : title;

  const titleLine2 =
    dotIndex !== -1 ? title.slice(dotIndex + 1).trim() : "";

  const mobileWords = title.trim().split(/\s+/);
  const mobileLine1 = mobileWords[0] || "";
  const mobileLine2 = mobileWords.slice(1, 3).join(" ");
  const mobileLine3 = mobileWords.slice(3).join(" ");

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-black
        h-[65svh]
        sm:h-[75svh]
        md:h-[100svh]
      "
    >
      {/* AMBIENT WARM SKELETON BACKDROP — renders immediately on frame 0, eliminating harsh black void */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #2a2318 0%, #15120d 60%, #0a0806 100%)",
        }}
      />

      {/* IMAGES */}
      {slides.map((slide, i) => (
        <div
          key={i}
          ref={(el) => setImageRef(el, i)}
          className="absolute inset-0"
          style={{
            opacity: i === 0 ? 1 : 0,
            zIndex: i === 0 ? 2 : 1,
          }}
        >
          <img
            src={getCleanImageUrl(slide.image?.url || slide.image)}
            alt={slide.image?.alt || slide.caption || ""}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = "true";
                e.currentTarget.src = "/uploads/hero1.jpg";
              }
            }}
            className="
              w-full
              h-[110%]
              md:h-full
              object-cover
              object-center
              md:object-[center_40%]
              transition-opacity duration-500
            "
            draggable={false}
          />
        </div>
      ))}

      {/* OVERLAY - Improved for mobile readability */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 5,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.70) 42%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0.12) 100%)",
        }}
      />

      {/* GOLD GLOW */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 6,
          background:
            "radial-gradient(circle at 18% 42%, rgba(219,176,74,0.14), transparent 38%)",
        }}
      />

      {/* CONTENT */}
      <div
        className="
          absolute
          inset-0
          flex
          items-end
          md:items-center
          pb-6
          md:pb-0
        "
        style={{ zIndex: 10 }}
      >
        <div
          ref={contentRef}
          className="
            w-full
            px-6
            sm:px-8
            md:px-12
            lg:px-20
            xl:px-24
          "
        >
          {/* SINGLE UNIFIED WRAPPER - everything inside stays narrow on mobile */}
          <div
            className="
              w-full
              max-w-[340px]
              mx-0
              md:mx-0
              md:max-w-[760px]
            "
          >
            {/* CAPTION — changes with image */}
            <div className="hero-item">
              <p
                className="uppercase"
                style={{
                  letterSpacing: "0.32em",
                  color: "rgba(255,255,255,0.58)",
                  fontSize: "clamp(0.68rem, 2vw, 0.8rem)",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                {currentSlide?.caption}
              </p>
            </div>

            {/* TITLE - Desktop and Mobile separate layouts */}
            {/* Desktop */}
            <div className="hidden md:block">
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(2.4rem, 9vw, 7rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.055em",
                  marginBottom: "clamp(0.6rem, 2vw, 1.4rem)",
                  wordBreak: "break-word",
                }}
              >
                {/* LINE 1 */}
                <span
                  style={{
                    display: "block",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #d7d7d7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {titleLine1}
                </span>

                {/* LINE 2 */}
                {titleLine2 && (
                  <span
                    style={{
                      display: "block",
                      marginTop: "0.08em",
                      background:
                        "linear-gradient(90deg, #FFE7A3 0%, #D4A13D 35%, #FFF4D2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter:
                        "drop-shadow(0 0 24px rgba(212,161,61,0.32))",
                    }}
                  >
                    {titleLine2}
                  </span>
                )}
              </h1>
            </div>

            {/* Mobile - custom line breaks */}
            <div className="block md:hidden">
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(2.4rem, 9vw, 7rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.055em",
                  marginBottom: "clamp(0.6rem, 2vw, 1.4rem)",
                  wordBreak: "break-word",
                }}
              >
                {/* LINE 1 - White */}
                <span
                  style={{
                    display: "block",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #d7d7d7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {mobileLine1}
                </span>

                {/* LINE 2 - White */}
                <span
                  style={{
                    display: "block",
                    marginTop: "0.08em",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #d7d7d7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {mobileLine2}
                </span>

                {/* LINE 3 - Gold */}
                <span
                  style={{
                    display: "block",
                    marginTop: "0.08em",
                    background:
                      "linear-gradient(90deg, #FFE7A3 0%, #D4A13D 35%, #FFF4D2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter:
                      "drop-shadow(0 0 24px rgba(212,161,61,0.32))",
                  }}
                >
                  {mobileLine3}
                </span>
              </h1>
            </div>

            {/* LINE — changes with image */}
            <div className="hero-item">
              <div
                style={{
                  width: "60px",
                  height: "1px",
                  marginBottom: "clamp(0.6rem, 2vw, 1.5rem)",
                  background:
                    "linear-gradient(90deg, #FFE7A3 0%, transparent 100%)",
                }}
              />
            </div>

            {/* DESCRIPTION — changes with image */}
            <div className="hero-item">
              <p
                style={{
                  fontSize: "clamp(0.85rem, 3vw, 1.1rem)",
                  lineHeight: 1.6,
                  maxWidth: "500px",
                  marginBottom: "clamp(1rem, 3vw, 2rem)",
                  color: "rgba(255,255,255,0.72)",
                  fontWeight: 300,
                }}
              >
                {currentSlide?.description}
              </p>
            </div>

            {/* BUTTONS - Stacked on mobile, left-aligned on desktop */}
            <div
              className="
                flex
                flex-col
                gap-3
                md:flex-row
              "
            >
              {data.primaryButtonText && (
                <Button
                  label={data.primaryButtonText}
                  href={data.primaryButtonLink}
                  bgColor="#C79A3B"
                  textColor="#fff"
                  rounded="rounded-lg"
                  padding="px-6 py-2.5 sm:px-7 sm:py-3"
                  fontWeight="font-semibold"
                  className="
                    w-full
                    md:w-auto
                    shadow-lg
                    hover:-translate-y-1
                    hover:shadow-[0_12px_30px_rgba(199,154,59,0.45)]
                  "
                />
              )}

              {data.secondaryButtonText && (
                <Button
                  label={data.secondaryButtonText}
                  href={data.secondaryButtonLink}
                  bgColor="rgba(255,255,255,0.05)"
                  textColor="#fff"
                  rounded="rounded-lg"
                  padding="px-6 py-2.5 sm:px-7 sm:py-3"
                  fontWeight="font-semibold"
                  className="
                    w-full
                    md:w-auto
                    border
                    border-white/30
                    bg-white/5
                    backdrop-blur-sm
                    hover:bg-white
                    hover:text-[#1A1A1A]
                    hover:border-white
                    hover:shadow-[0_10px_30px_rgba(255,255,255,0.18)]
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                />
              )}
            </div>

            {/* INDICATORS - Centered on mobile, left-aligned on desktop */}
            <div
              className="
                hero-item
                flex
                items-center
                justify-center
                md:justify-start
              "
              style={{
                gap: "10px",
                marginTop: "clamp(1rem, 3vw, 2.5rem)",
              }}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => changeSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    width: i === activeIndex ? "50px" : "16px",
                    height: "2px",
                    border: "none",
                    borderRadius: "999px",
                    cursor: "pointer",
                    transition: "all 0.55s ease",
                    background:
                      i === activeIndex
                        ? "linear-gradient(90deg, #FFF1C8 0%, #D4A13D 100%)"
                        : "rgba(255,255,255,0.24)",
                    boxShadow:
                      i === activeIndex
                        ? "0 0 18px rgba(212,161,61,0.35)"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION ARROWS — minimal, light & subtle */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="
              absolute
              left-3 sm:left-5 md:left-8
              top-1/2 -translate-y-1/2
              z-20
              w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
              rounded-full
              flex items-center justify-center
              text-white/70 hover:text-white
              bg-black/20 hover:bg-black/45 active:bg-black/60
              border border-white/15 hover:border-white/40
              backdrop-blur-sm
              transition-all duration-300
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-1 focus:ring-white/40
              cursor-pointer
            "
          >
            <ChevronLeft className="w-5 h-5 -translate-x-[0.5px]" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="
              absolute
              right-3 sm:right-5 md:right-8
              top-1/2 -translate-y-1/2
              z-20
              w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
              rounded-full
              flex items-center justify-center
              text-white/70 hover:text-white
              bg-black/20 hover:bg-black/45 active:bg-black/60
              border border-white/15 hover:border-white/40
              backdrop-blur-sm
              transition-all duration-300
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-1 focus:ring-white/40
              cursor-pointer
            "
          >
            <ChevronRight className="w-5 h-5 translate-x-[0.5px]" strokeWidth={1.5} />
          </button>
        </>
      )}
    </section>
  );
};

export default Hero;