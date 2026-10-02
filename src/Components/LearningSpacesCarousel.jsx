import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "./Button";
import { getCleanImageUrl } from "../utils/imageUrl";

export default function HeroSection({ data }) {
  const DURATION = 4.5;
  const [index, setIndex] = useState(0);

  const imageRefMobile = useRef(null);
  const imageRefDesktop = useRef(null);
  const textRefMobile = useRef(null);
  const textRefDesktop = useRef(null);
  const barFillRefMobile = useRef(null);
  const barFillRefDesktop = useRef(null);
  const progressTweenRef = useRef(null);
  const isAnimating = useRef(false);

  const slides = data?.slides || [];

  // Preload all slide images into memory immediately
  useEffect(() => {
    slides.forEach((slide) => {
      const img = slide?.image;
      const url = getCleanImageUrl(img?.url || img || "");
      if (url) {
        const image = new Image();
        image.src = url;
      }
    });
  }, [slides]);

  const startProgress = () => {
    progressTweenRef.current?.kill();
    const bars = [barFillRefMobile.current, barFillRefDesktop.current].filter(Boolean);
    if (!bars.length) return;

    gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });

    progressTweenRef.current = gsap.to(bars, {
      scaleX: 1,
      duration: DURATION,
      ease: "none",
    });
  };

  const transitionToSlide = (nextIndex) => {
    if (isAnimating.current || nextIndex === index) return;
    isAnimating.current = true;

    progressTweenRef.current?.kill();

    const textTargets = [
      textRefMobile.current,
      textRefDesktop.current,
    ].filter(Boolean);

    setIndex(nextIndex);

    gsap.fromTo(
      textTargets,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => {
          isAnimating.current = false;
        },
      }
    );
  };

  useEffect(() => {
    if (!slides.length) return;

    startProgress();

    if (slides.length <= 1) return;

    const timer = setTimeout(() => {
      const next = (index + 1) % slides.length;
      transitionToSlide(next);
    }, DURATION * 1000);

    return () => {
      clearTimeout(timer);
      progressTweenRef.current?.kill();
    };
  }, [index, slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#FBFAF7]">
      <div className="relative mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-24">
        
        {/* ================= MOBILE LAYOUT ================= */}
        <div className="lg:hidden">
          {/* IMAGE */}
          <div className="relative w-full h-[230px] rounded-3xl overflow-hidden bg-[#E8E2D5] shadow-[0_30px_80px_rgba(0,0,0,0.20)]">
            {slides.map((s, i) => {
              const imgUrl = getCleanImageUrl(s?.image?.url || s?.image || "");
              const isCurrent = i === index;
              return (
                <img
                  key={s._id || i}
                  src={imgUrl}
                  alt={s?.title || ""}
                  loading="eager"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full rounded-3xl object-cover transition-opacity duration-500 ease-in-out ${
                    isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = "true";
                      e.currentTarget.src = "/uploads/space.jpg";
                    }
                  }}
                />
              );
            })}
          </div>

          {/* INDICATORS */}
          <div className="mt-5 flex items-center gap-2">
            {slides.map((_, i) => {
              const isActive = i === index;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => transitionToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative flex-1 py-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A13D] rounded-full"
                >
                  <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-black/10 transition-colors group-hover:bg-black/20">
                    {i < index && (
                      <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                    )}

                    {isActive && (
                      <div className="absolute inset-0">
                        <div
                          ref={barFillRefMobile}
                          className="h-full w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* TITLE */}
          <div className="mt-8">
            <div className="h-[2px] w-10 bg-[#D4A13D]" />

            <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight text-gray-900">
              {data.title}
            </h1>

            <p className="mt-5 text-[16px] leading-relaxed text-gray-600">
              {data.subtitle}
            </p>
          </div>

          {/* CARD */}
          <div
            ref={textRefMobile}
            className="
              mt-8
              relative
              overflow-hidden
              rounded-[18px]
              bg-white
              px-6
              py-7
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              border
              border-[#EFE9DE]
            "
          >
            <div className="absolute left-0 top-0 h-full w-[3px] bg-[#D4A13D]" />
            
            <h3 className="font-serif text-[1.75rem] leading-[1.1] text-[#171717]">
              {slides[index]?.title}
            </h3>

            <p className="mt-2 text-[14px] leading-6 text-[#6B6B6B]">
              {slides[index]?.desc}
            </p>
          </div>

          {/* BUTTONS - MOBILE */}
          <div className="mt-8 flex items-center gap-10">
            <Button
              label={data.primaryButton}
              href={data.primaryButtonLink}
              bgColor="#e5b03e"
              textColor="#020202"
              rounded="rounded-[3px]"
              padding="px-11 py-3"
              fontWeight="font-semibold"
              className="min-w-[128px] text-center"
            />

            {data.secondaryButton && (
              <div className="flex h-[50px] items-center">
                <a
                  href={data.secondaryButtonLink}
                  className="
                    inline-flex
                    items-center
                    uppercase
                    font-semibold
                    text-[15px]
                    tracking-[0.04em]
                    text-[#171717]
                    border-b
                    border-[#171717]
                    pb-[3px]
                    leading-none
                    transition-all
                    duration-300
                    hover:text-[#D4A13D]
                    hover:border-[#D4A13D]
                  "
                >
                  {data.secondaryButton}
                  <span className="ml-2">→</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <div className="relative mt-16 sm:mt-20 lg:mt-40 h-[300px] sm:h-[380px] w-full rounded-3xl overflow-hidden bg-[#E8E2D5] shadow-[0_30px_80px_rgba(0,0,0,0.20)]">
              {slides.map((s, i) => {
                const imgUrl = getCleanImageUrl(s?.image?.url || s?.image || "");
                const isCurrent = i === index;
                return (
                  <img
                    key={s._id || i}
                    src={imgUrl}
                    alt={s?.title || ""}
                    loading="eager"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full rounded-3xl object-cover transition-opacity duration-500 ease-in-out ${
                      isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                    onError={(e) => {
                      if (!e.currentTarget.dataset.retried) {
                        e.currentTarget.dataset.retried = "true";
                        e.currentTarget.src = "/uploads/space.jpg";
                      }
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-2">
              {slides.map((_, i) => {
                const isActive = i === index;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => transitionToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="relative flex-1 py-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A13D] rounded-full"
                  >
                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-black/10 transition-colors group-hover:bg-black/20">
                      {i < index && (
                        <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                      )}

                      {isActive && (
                        <div className="absolute inset-0">
                          <div
                            ref={barFillRefDesktop}
                            className="h-full w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-black/5 backdrop-blur">
              <span />
              {data.badge}
            </div>

            <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight text-gray-900 sm:text-[54px]">
              {data.title}
            </h1>

            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-gray-600 sm:text-[17px]">
              {data.subtitle}
            </p>

            {/* CARD */}
            <div
              ref={textRefDesktop}
              className="
                mt-10
                relative
                overflow-hidden
                rounded-[18px]
                bg-white
                px-7
                py-7
                shadow-[0_18px_45px_rgba(0,0,0,0.08)]
                border
                border-[#EFE9DE]
              "
            >
              <div className="absolute left-0 top-0 h-full w-[3px] bg-[#D4A13D]" />
              
              <h3 className="font-serif text-[1.3rem] leading-[1.1] text-[#171717] sm:text-2xl">
                {slides[index]?.title}
              </h3>

              <p className="mt-2 text-[14px] leading-6 text-[#6B6B6B]">
                {slides[index]?.desc}
              </p>
            </div>

            {/* BUTTONS - DESKTOP */}
            <div className="mt-8 flex items-center gap-10">
              <Button
                label={data.primaryButton}
                href={data.primaryButtonLink}
                bgColor="#e5b03e"
                textColor="#000000"
                rounded="rounded-[3px]"
                padding="px-11 py-3"
                fontWeight="font-semibold"
                className="min-w-[128px] text-center"
              />
              {data.secondaryButton && (
                <div className="flex h-[50px] items-center">
                  <a
                    href={data.secondaryButtonLink}
                    className="
                      inline-flex
                      items-center
                      uppercase
                      font-semibold
                      text-[15px]
                      tracking-[0.04em]
                      text-[#171717]
                      border-b
                      border-[#171717]
                      pb-[3px]
                      leading-none
                      transition-all
                      duration-300
                      hover:text-[#D4A13D]
                      hover:border-[#D4A13D]
                    "
                  >
                    {data.secondaryButton}
                    <span className="ml-2">→</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}