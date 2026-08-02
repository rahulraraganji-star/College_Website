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

      // One continuous tween that never restarts — travels a huge multiple of
      // setWidth at the same speed, while the modifier wraps the rendered x
      // every frame. No repeat = no engine-level reset/snap.
      tween = gsap.to(track, {
        x: -setWidth * 9999,
        duration: 14 * 9999,
        ease: "none",
        modifiers: {
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

  // Purely visual font/weight variety, applied by position — not derived from data.
  // Keyed off the ORIGINAL item index (i % items.length), not the tripled array's
  // index, so all 3 rendered copies are pixel-identical and setWidth stays accurate.
  const fontPattern = ["Fraunces", "Playfair Display", "Inter"];
  const getFont = (originalIndex) => fontPattern[originalIndex % fontPattern.length];
  const getIsBold = (originalIndex) => (originalIndex * 37) % 5 === 0;

  return (
    <section className="mt-48 w-full overflow-hidden bg-white py-4">
      <div
        ref={trackRef}
        className="flex w-max items-center whitespace-nowrap"
      >
        {[...items, ...items, ...items].map((item, i) => {
          const originalIndex = i % items.length;
          return (
            <span
              key={i}
              className="mr-16 text-[26px] tracking-[1.4px] text-black whitespace-nowrap"
              style={{
                fontFamily: getFont(originalIndex),
                fontWeight: getIsBold(originalIndex) ? 700 : 500,
              }}
            >
              {item.text}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default EventsMarquee;