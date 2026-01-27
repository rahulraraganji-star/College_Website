import { useEffect, useRef } from "react";
import gsap from "gsap";

const events = [
  { text: "HACKATHON", font: "Oswald" },
  { text: "TECH FEST", font: "Playfair Display" },
  { text: "CULTURAL NIGHT", font: "Londrina Solid" },
  { text: "WORKSHOP", font: "Fjalla One" },
  { text: "AI SUMMIT", font: "Oswald" },
  { text: "DESIGN SPRINT", font: "Playfair Display" },
  { text: "CODING JAM", font: "Fjalla One" },
  { text: "STARTUP MEET", font: "Londrina Solid" },
];

const EventsMarquee = () => {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    let tween;

    const setupMarquee = () => {
      const totalWidth = track.scrollWidth / 2;

      gsap.set(track, { x: 0, willChange: "transform" });

      tween = gsap.to(track, {
        x: -totalWidth,
        duration: 20,
        ease: "linear",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
        },
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(setupMarquee);
    } else {
      setupMarquee();
    }

    return () => tween && tween.kill();
  }, []);

  return (
    /* pushed further down from hero */
    <section className="mt-48 w-full overflow-hidden bg-white py-4">
      <div
        ref={trackRef}
        className="flex w-max items-center whitespace-nowrap"
      >
        {[...events, ...events].map((item, i) => (
          <span
            key={i}
            className="mr-16 text-[26px] tracking-[1.4px] text-black whitespace-nowrap"
            style={{
              fontFamily: item.font,
              fontWeight:
                item.font === "Playfair Display" ? 600 : 500,
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </section>
  );
};

export default EventsMarquee;
