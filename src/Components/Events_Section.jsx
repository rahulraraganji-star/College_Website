import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const getEventImage = (event) =>
  event?.image || event?.imageUrl || event?.photo || event?.thumbnail || "";

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
    data?.frontImage ||
    data?.coverImage ||
    data?.image ||
    getEventImage(visibleEvents[0]);

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
          <button
            ref={buttonRef}
            className="bg-[#FFC107] px-8 py-3 rounded-xl font-semibold"
          >
            {data?.buttonText}
          </button>
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
  );
};

export default Events_Section;
