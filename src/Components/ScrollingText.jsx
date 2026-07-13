import { useEffect, useRef } from "react";
import gsap from "gsap";

const EventsMarquee = ({ data }) => {
  const trackRef = useRef(null);

  const items = data?.items || [];

  useEffect(() => {
    if (!items.length) return;

    const track = trackRef.current;
    let tween;

    const setupMarquee = () => {
      // track renders 3 copies of items, so one full set is 1/3 of scrollWidth
      const setWidth = track.scrollWidth / 3;

      gsap.set(track, {
        x: 0,
        force3D: true,
        willChange: "transform",
      });

      tween = gsap.to(track, {
        x: -setWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          // wraps the x value every frame so the loop point is mathematically
          // seamless instead of snapping back on each repeat
          x: gsap.utils.unitize((x) => parseFloat(x) % -setWidth),
        },
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(setupMarquee);
    } else {
      setupMarquee();
    }

    return () => tween && tween.kill();
  }, [items.length]);

  if (!items.length) return null;

  // Purely visual font/weight variety, applied by position — not derived from data
  const fontPattern = ["Fraunces", "Playfair Display", "Inter"];
  const getFont = (i) => fontPattern[i % fontPattern.length];
  const getIsBold = (i) => (i * 37) % 5 === 0; // scattered, deterministic "random" look

  return (
    <section className="mt-48 w-full overflow-hidden bg-white py-4">
      <div
        ref={trackRef}
        className="flex w-max items-center whitespace-nowrap"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mr-16 text-[26px] tracking-[1.4px] text-black whitespace-nowrap"
            style={{
              fontFamily: getFont(i),
              fontWeight: getIsBold(i) ? 700 : 500,
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