import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCleanImageUrl } from "../utils/imageUrl";

gsap.registerPlugin(ScrollTrigger);

const getEventImage = (event) => {
  const image =
    event?.image ||
    event?.imageUrl ||
    event?.photo ||
    event?.thumbnail;

  return getCleanImageUrl(image?.url || image || "");
};

const getEventTitle = (event) => event?.title || event?.name || "";
const getEventDescription = (event) => event?.description || event?.desc || "";
const getEventDepartment = (event) =>
  event?.department || event?.dept || event?.organizer || event?.organisedBy || "";
const getEventLocation = (event) =>
  event?.location || event?.campusLine || event?.venue || "";
const getEventUpdated = (event) =>
  event?.updated || event?.updatedText || event?.date || "";

const Events_Section = ({ data }) => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const subTextRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const innersRef = useRef([]);

  const events = data?.events || data?.items || data?.cards || [];
  const visibleEvents = events.slice(0, 3);
  const frontImage = getCleanImageUrl(
    data?.frontImage?.url ||
    data?.frontImage ||
    data?.coverImage?.url ||
    data?.coverImage ||
    data?.image?.url ||
    data?.image ||
    getEventImage(visibleEvents[0])
  );

  // ONLY DESKTOP GSAP ANIMATION - UNTOUCHED
  useLayoutEffect(() => {
    if (!visibleEvents.length) return undefined;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current;
      const inners = innersRef.current;

      gsap.set([headerRef.current, subTextRef.current], {
        y: 50,
        opacity: 0,
      });

      gsap.set(buttonRef.current, {
        y: 35,
        opacity: 0,
      });

      gsap.set(containerRef.current, {
        width: "72%",
        gap: 0,
      });

      gsap.set(cards, { x: 0 });

      gsap.set(inners, {
        rotateY: 0,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
        },
      });

      tl.to(headerRef.current, { y: -25, opacity: 1, duration: 0.6 });
      tl.to(subTextRef.current, { y: -25, opacity: 1, duration: 0.6 }, "<0.1");
      tl.to(buttonRef.current, { y: -18, opacity: 1, duration: 0.55 }, "<0.08");

      tl.to(containerRef.current, {
        width: "60%",
        duration: 0.75,
        ease: "expo.out",
      });

      tl.to(containerRef.current, {
        gap: 24,
        duration: 0.75,
        ease: "expo.out",
      });

      if (cards[0]) tl.to(cards[0], { x: -24, duration: 0.75 }, "<");
      if (cards[2]) tl.to(cards[2], { x: 24, duration: 0.75 }, "<");

      tl.to(
        inners,
        {
          rotateY: 180,
          duration: 0.9,
          ease: "power2.inOut",
          stagger: { each: 0.16, from: "center" },
        },
        "+=0.05"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [visibleEvents.length]);

  if (!visibleEvents.length) return null;

  return (
    <section className="relative bg-[#F1EEE8]">

      {/* ================= MOBILE LAYOUT ================= */}
      <div className="lg:hidden px-5 py-16">
        {/* Title */}
<h2
  className="
    font-serif
    w-full
    max-w-[340px]
    text-[42px]
    leading-[1.05]
    tracking-[-0.02em]
    font-normal
    text-[#171717]
  "
>
  {(() => {
    const title = data?.title || "";

    const splitIndex = title.indexOf(" Fr ");

    if (splitIndex !== -1) {
      return (
        <>
          <span className="block">
            {title.slice(0, splitIndex)}
          </span>

          <span className="block">
            {title.slice(splitIndex + 1)}
          </span>
        </>
      );
    }

    return title;
  })()}
</h2>

        {/* Subtitle */}
        <p className="mt-4 max-w-[310px] text-[15px] leading-7 text-[#666]">
          {data?.subtitle || data?.description}
        </p>

        {/* Explore Link */}
        <a
          href={data?.buttonLink || "#"}
          className="inline-flex items-center mt-6 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#171717] border-b border-[#171717] pb-[3px] leading-none transition-all duration-300 hover:text-[#D4A13D] hover:border-[#D4A13D]"
        >
          {data?.buttonText || "Explore"}
          <span className="ml-2 text-[16px]">→</span>
        </a>

        {/* Horizontal Cards */}
        <div
          className="
            mt-10
            flex
            gap-5
            overflow-x-auto
            snap-x
            snap-mandatory
            pb-4
            scrollbar-hide
            -mx-5
            px-5
          "
        >
          {visibleEvents.map((event, i) => (
            <div
              key={event._id || event.id || i}
              className="
                w-[86%]
                max-w-[360px]
                sm:max-w-[400px]
                shrink-0
                snap-center
                overflow-hidden
                rounded-[24px]
                bg-white
                shadow-xl
                flex
                flex-col
              "
            >
              {/* Image Section - Exact same height across all cards on every screen */}
              <div className="relative h-[230px] sm:h-[240px] w-full overflow-hidden rounded-t-[24px] bg-[#EAE4D9]">
                <img
                  src={getEventImage(event)}
                  alt={getEventTitle(event)}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = "true";
                      e.currentTarget.src = "/uploads/event1.jpg";
                    }
                  }}
                />

                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-black/5 max-w-[75%] truncate">
                    {getEventDepartment(event)}
                  </span>

                  <span className="h-9 w-9 shrink-0 rounded-full bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white text-[21px] sm:text-[23px] leading-tight font-semibold line-clamp-2">
                    {getEventTitle(event)}
                  </h3>
                  {getEventLocation(event) && (
                    <p className="mt-1 text-sm text-white/85 truncate">
                      {getEventLocation(event)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white">
                <div>
                  {/* Card description */}
                  <p className="text-[14px] leading-6 text-[#5E5E5E] line-clamp-3 break-words">
                    {getEventDescription(event)}
                  </p>

                  {/* Bottom information box - flex-wrap and min-w-0 prevent overlapping */}
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#FAF6EF] border border-[#E9DFD0] px-4 py-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Icon box */}
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF9] border border-[#E9DFD0]">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3l9 4-9 4-9-4 9-4z" />
                          <path d="M21 10v6" />
                          <path d="M3 10v6c0 3 4 5 9 5s9-2 9-5v-6" />
                        </svg>
                      </span>

                      <div className="text-left min-w-0 flex-1">
                        {/* Organised by text */}
                        <p className="text-[11px] uppercase tracking-wide text-[#7A7A7A]">
                          Organised by
                        </p>
                        {/* Department */}
                        <p className="text-[16px] sm:text-[18px] font-semibold text-[#171717] truncate">
                          {getEventDepartment(event)}
                        </p>
                      </div>
                    </div>

                    {/* Updated text */}
                    {getEventUpdated(event) && (
                      <span className="text-[12px] sm:text-[13px] font-medium text-[#8D6B32] shrink-0 whitespace-nowrap">
                        {getEventUpdated(event)}
                      </span>
                    )}
                  </div>
                </div>

                {data?.footerText && (
                  <div className="pt-3 text-center text-xs text-gray-500">
                    {data?.footerText}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="hidden lg:block">
        <section
          ref={sectionRef}
          className="relative min-h-[240vh] bg-[#F1EEE8]"
        >
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <div className="absolute top-6 lg:top-[6%] xl:top-[9%] 2xl:top-[12%] left-1/2 -translate-x-1/2 text-center z-20">
              <h1
                ref={headerRef}
                className="text-4xl xl:text-5xl mb-3 xl:mb-4 font-serif text-gray-900"
              >
                {data?.title}
              </h1>
              <p ref={subTextRef} className="text-base xl:text-lg text-gray-600 mb-4 xl:mb-6">
                {data?.subtitle || data?.description}
              </p>
              <a
                ref={buttonRef}
                href={data?.buttonLink || "#"}
                className="
                  group relative inline-block px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden
                  bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-[length:200%_100%]
                  shadow-[0_8px_30px_rgba(245,158,11,0.3)]
                  hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)]
                  hover:bg-[position:100%_0]
                  transition-all duration-500 ease-out
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full
                  hover:before:translate-x-full before:transition-transform before:duration-700 before:ease-out
                "
              >
                <span className="relative z-10 flex items-center gap-2">
                  {data?.buttonText}
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </div>

            <div
              ref={containerRef}
              className="flex translate-y-28 [perspective:1400px]"
            >
              {visibleEvents.map((event, i) => (
                <div
                  key={event._id || event.id || i}
                  ref={(el) => (cardsRef.current[i] = el)}
                  className="relative flex-1 aspect-[5/7]"
                >
                  <div
                    ref={(el) => (innersRef.current[i] = el)}
                    className="relative w-full h-full [transform-style:preserve-3d]"
                  >
                    <div className="absolute inset-0 backface-hidden overflow-hidden">
                      <div
                        className="absolute inset-0 bg-[#EAE4D9]"
                        style={{
                          backgroundImage: frontImage ? `url(${frontImage})` : undefined,
                          backgroundSize: "300% 100%",
                          backgroundPosition: `${i * 50}% center`,
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white border shadow-xl flex flex-col overflow-hidden rounded-2xl ring-1 ring-black/5">
                      <div className="relative h-[50%] w-full shrink-0 bg-[#EAE4D9] overflow-hidden">
                        <img
                          src={getEventImage(event)}
                          alt={getEventTitle(event)}
                          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = "true";
                              e.currentTarget.src = "/uploads/event1.jpg";
                            }
                          }}
                        />

                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-black/5 max-w-[75%] truncate">
                            {getEventDepartment(event)}
                          </span>

                          <span className="h-9 w-9 shrink-0 rounded-full bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-[22px] xl:text-[24px] 2xl:text-[26px] leading-tight font-semibold line-clamp-2">
                            {getEventTitle(event)}
                          </h3>
                          <p className="mt-1 text-sm text-white/85 truncate">
                            {getEventLocation(event)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 p-4 xl:p-5 flex flex-col justify-between bg-white min-h-0">
                        <div className="flex flex-col justify-between flex-1 min-h-0">
                          <p className="text-gray-700 leading-relaxed text-[13px] xl:text-[14px] line-clamp-3">
                            {getEventDescription(event)}
                          </p>

                          <div className="mt-3 xl:mt-4 flex items-center justify-between rounded-2xl bg-gray-50 border border-black/5 px-3.5 py-2.5 xl:px-4 xl:py-3 min-w-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-black/5">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5 text-gray-800"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 3l9 4-9 4-9-4 9-4z" />
                                  <path d="M21 10v6" />
                                  <path d="M3 10v6c0 3 4 5 9 5s9-2 9-5v-6" />
                                </svg>
                              </span>

                              <div className="text-left min-w-0 flex-1">
                                <p className="text-xs text-gray-500">Organised by</p>
                                <p className="text-xs xl:text-sm font-semibold text-gray-900 truncate">
                                  {getEventDepartment(event)}
                                </p>
                              </div>
                            </div>

                            {getEventUpdated(event) && (
                              <span className="text-xs font-medium text-gray-600 shrink-0 ml-2 whitespace-nowrap">
                                {getEventUpdated(event)}
                              </span>
                            )}
                          </div>
                        </div>

                        {data?.footerText && (
                          <div className="pt-2 text-center text-xs text-gray-500">
                            {data?.footerText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

    </section>
  );
};

export default Events_Section;