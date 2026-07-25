import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll-reveal hook — no external animation library required.
 * Returns a ref to attach to the observed element and a boolean that
 * flips to true once the element enters the viewport. This is a
 * one-time reveal (it stops observing after triggering), not a
 * repeating effect, which keeps the page calm rather than jittery on
 * every scroll pass.
 */
export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the browser doesn't support IntersectionObserver, just show
    // the content immediately rather than leaving it invisible.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};
