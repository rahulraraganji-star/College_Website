import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import image from "../assets/image.png";

gsap.registerPlugin(ScrollTrigger);

const BIG_IMAGE = image;

const Events_Section = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const subTextRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const innersRef = useRef([]);

  useLayoutEffect(() => {
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

      tl.to(cards[0], { x: -24, duration: 0.75 }, "<");
      tl.to(cards[2], { x: 24, duration: 0.75 }, "<");

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
  }, []);

  const titles = [
    "Dance Competition",
    "Bharatanatyam Performance",
    "Student Creativity",
  ];

  const descriptions = [
    "The Dance Competition at Fr. Agnel's lit up the stage.",
    "A mesmerizing Bharatanatyam performance.",
    "Students celebrating creativity and learning.",
  ];

  const eventImages = [
    "https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  ];

  const dept = [
    "Cultural Committee",
    "Performing Arts Club",
    "Student Council",
  ];

  const campusLine = [
    "Fr. Agnel Campus",
    "Fr. Agnel Auditorium",
    "Innovation Hub",
  ];

  const updated = [
    "Updated this week",
    "Updated today",
    "Updated recently",
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[240vh] bg-[#F1EEE8]"
    >
      {/* Sticky wrapper replaces pin */}
      <div className="sticky top-0 h-screen flex items-center justify-center">
        {/* HEADER */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 text-center z-20">
          <h1
            ref={headerRef}
            className="text-5xl mb-4 font-serif text-gray-900"
          >
            What’s On Fr Agnel
          </h1>
          <p ref={subTextRef} className="text-lg text-gray-600 mb-6">
            From academics to celebrations — catch every highlight here.
          </p>
          <button
            ref={buttonRef}
            className="bg-[#FFC107] px-8 py-3 rounded-xl font-semibold"
          >
            Explore More
          </button>
        </div>

        {/* CARDS */}
        <div
          ref={containerRef}
          className="flex translate-y-28 [perspective:1400px]"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="relative flex-1 aspect-[5/7]"
            >
              <div
                ref={(el) => (innersRef.current[i] = el)}
                className="relative w-full h-full [transform-style:preserve-3d]"
              >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${BIG_IMAGE})`,
                      backgroundSize: "300% 100%",
                      backgroundPosition: `${i * 50}% center`,
                    }}
                  />
                </div>

                {/* BACK */}
               {/* BACK — original premium design restored */}
<div className="absolute inset-0 rotate-y-180 backface-hidden bg-white border shadow-xl flex flex-col overflow-hidden rounded-2xl ring-1 ring-black/5">

  {/* HERO IMAGE */}
  <div className="relative h-[58%] w-full">
    <img
      src={eventImages[i]}
      alt={titles[i]}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />

    {/* overlays */}
    <div className="absolute inset-0 bg-black/20" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

    {/* Top row */}
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-black/5">
        {dept[i]}
      </span>

      <span className="h-9 w-9 rounded-full bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
      </span>
    </div>

    {/* Title */}
    <div className="absolute bottom-4 left-4 right-4">
      <h3 className="text-white text-[26px] leading-tight font-semibold">
        {titles[i]}
      </h3>
      <p className="mt-1 text-sm text-white/85">
        {campusLine[i]}
      </p>
    </div>
  </div>

  {/* BODY */}
  <div className="flex-1 p-6 flex flex-col justify-between bg-white">
    <div>
      <p className="text-gray-700 leading-relaxed">
        {descriptions[i]}
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
              {dept[i]}
            </p>
          </div>
        </div>

        <span className="text-xs font-medium text-gray-600">
          {updated[i]}
        </span>
      </div>
    </div>

    <div className="pt-3 text-center text-xs text-gray-500">
      Explore more events from clubs & committees.
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