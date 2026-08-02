import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Button from "./Button";

const Hero = ({ data }) => {
  const slides = data?.slides || [];

  const [activeIndex, setActiveIndex] = useState(0);

  const imageRefs = useRef([]);
  const contentRef = useRef(null);
  const isAnimating = useRef(false);

  const AUTOPLAY_INTERVAL = 6500;

  const setImageRef = (el, i) => {
    imageRefs.current[i] = el;
  };

  // CAROUSEL TRANSITION — smooth crossfade only
  const changeSlide = useCallback(
    (nextIndex) => {
      if (isAnimating.current) return;

      const current = imageRefs.current[activeIndex];
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
    },
    [activeIndex]
  );

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
      changeSlide(next);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex, slides.length, changeSlide]);

  if (!slides.length) return null;

  const currentSlide = slides[activeIndex];

  const title = data.title || "Empowering Minds. Building Futures";

  const dotIndex = title.indexOf(".");

  const titleLine1 =
    dotIndex !== -1 ? title.slice(0, dotIndex + 1) : title;

  const titleLine2 =
    dotIndex !== -1 ? title.slice(dotIndex + 1).trim() : "";

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{
        height: "100svh",
        minHeight: "720px",
      }}
    >
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
            src={slide.image?.url || slide.image}
            alt={slide.image?.alt || slide.caption || ""}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      ))}

      {/* OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 5,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 40%, rgba(0,0,0,0.18) 74%, rgba(0,0,0,0.08) 100%)",
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
        className="absolute inset-0 flex items-center"
        style={{ zIndex: 10 }}
      >
        <div
          ref={contentRef}
          className="w-full px-8 sm:px-12 md:px-16 lg:px-24"
          style={{
            maxWidth: "980px",
          }}
        >
          {/* CAPTION — changes with image */}
          <div className="hero-item">
            <p
              className="uppercase"
              style={{
                letterSpacing: "0.32em",
                color: "rgba(255,255,255,0.58)",
                fontSize: "0.76rem",
                marginBottom: "1.5rem",
                fontWeight: 500,
              }}
            >
              {currentSlide?.caption}
            </p>
          </div>

          {/* TITLE — static, does not move or fade on slide change */}
          <div>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(3.5rem, 6.5vw, 7rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.055em",
                marginBottom: "2rem",
                maxWidth: "860px",
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

          {/* LINE — changes with image */}
          <div className="hero-item">
            <div
              style={{
                width: "82px",
                height: "1px",
                marginBottom: "2rem",
                background:
                  "linear-gradient(90deg, #FFE7A3 0%, transparent 100%)",
              }}
            />
          </div>

          {/* DESCRIPTION — changes with image */}
          <div className="hero-item">
            <p
              style={{
                fontSize: "clamp(1rem, 1.4vw, 1.12rem)",
                lineHeight: 1.9,
                maxWidth: "540px",
                marginBottom: "2.8rem",
                color: "rgba(255,255,255,0.72)",
                fontWeight: 300,
              }}
            >
              {currentSlide?.description}
            </p>
          </div>

          {/* BUTTONS */}

<div className="flex flex-wrap items-center gap-5">

  {data.primaryButtonText && (
    <Button
  label={data.primaryButtonText}
  href={data.primaryButtonLink}
  bgColor="#C79A3B"
  textColor="#fff"
  rounded="rounded-lg"
  padding="px-8 py-3"
  fontWeight="font-semibold"
  className="
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
  padding="px-8 py-3"
  fontWeight="font-semibold"
  className="
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

          {/* INDICATORS — changes with image */}
          <div
            className="hero-item flex items-center"
            style={{
              gap: "12px",
              marginTop: "3.5rem",
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => changeSlide(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === activeIndex ? "58px" : "18px",
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
    </section>
  );
};

export default Hero;