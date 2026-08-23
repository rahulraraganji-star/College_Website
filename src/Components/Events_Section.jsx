import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const getEventImage = (event) => {
  const image =
    event?.image ||
    event?.imageUrl ||
    event?.photo ||
    event?.thumbnail;

  return image?.url || image || "";
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
  const frontImage =
    data?.frontImage?.url ||
    data?.frontImage ||
    data?.coverImage?.url ||
    data?.coverImage ||
    data?.image?.url ||
    data?.image ||
    getEventImage(visibleEvents[0]);

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
          "
        >
          {visibleEvents.map((event, i) => (
            <div
              key={event._id || event.id || i}
              className="
                min-w-[86%]
                snap-center
                overflow-hidden
                rounded-[24px]
                bg-white
                shadow-xl
                flex
                flex-col
              "
            >
              {/* Image Section - Fixed height */}
              <div className="relative h-[230px] w-full">
                <img
                  src={getEventImage(event)}
                  alt={getEventTitle(event)}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-black/5">
                    {getEventDepartment(event)}
                  </span>

                  <span className="h-9 w-9 rounded-full bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-[26px] leading-tight font-semibold">
                    {getEventTitle(event)}
                  </h3>
                  <p className="mt-1 text-sm text-white/85">
                    {getEventLocation(event)}
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                <div>
                  {/* UPDATED: Card description */}
                  <p className="text-[14px] leading-6 text-[#5E5E5E]">
                    {getEventDescription(event)}
                  </p>

                  {/* UPDATED: Bottom information box */}
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#FAF6EF] border border-[#E9DFD0] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* UPDATED: Icon box */}
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFDF9] border border-[#E9DFD0]">
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

                      <div className="text-left">
                        {/* UPDATED: Organised by text */}
                        <p className="text-[11px] uppercase tracking-wide text-[#7A7A7A]">
                          Organised by
                        </p>
                        {/* UPDATED: Department */}
                        <p className="text-[18px] font-semibold text-[#171717]">
                          {getEventDepartment(event)}
                        </p>
                      </div>
                    </div>

                    {/* UPDATED: Updated text */}
                    <span className="text-[13px] font-medium text-[#8D6B32]">
                      {getEventUpdated(event)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 text-center text-xs text-gray-500">
                  {data?.footerText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (100% UNTOUCHED) ================= */}
      <div className="hidden lg:block">
        <section
          ref={sectionRef}
          className="relative min-h-[240vh] bg-[#F1EEE8]"
        >
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 text-center z-20">
              <h1
                ref={headerRef}
                className="text-5xl mb-4 font-serif text-gray-900"
              >
                {data?.title}
              </h1>
              <p ref={subTextRef} className="text-lg text-gray-600 mb-6">
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
                        className="absolute inset-0 bg-gray-200"
                        style={{
                          backgroundImage: frontImage ? `url(${frontImage})` : undefined,
                          backgroundSize: "300% 100%",
                          backgroundPosition: `${i * 50}% center`,
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white border shadow-xl flex flex-col overflow-hidden rounded-2xl ring-1 ring-black/5">
                      <div className="relative h-[58%] w-full">
                        <img
                          src={getEventImage(event)}
                          alt={getEventTitle(event)}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />

                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-black/5">
                            {getEventDepartment(event)}
                          </span>

                          <span className="h-9 w-9 rounded-full bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-[26px] leading-tight font-semibold">
                            {getEventTitle(event)}
                          </h3>
                          <p className="mt-1 text-sm text-white/85">
                            {getEventLocation(event)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                        <div>
                          <p className="text-gray-700 leading-relaxed">
                            {getEventDescription(event)}
                          </p>

                          <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 border border-black/5 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-black/5">
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

                              <div className="text-left">
                                <p className="text-xs text-gray-500">Organised by</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {getEventDepartment(event)}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-medium text-gray-600">
                              {getEventUpdated(event)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 text-center text-xs text-gray-500">
                          {data?.footerText}
                        </div>
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