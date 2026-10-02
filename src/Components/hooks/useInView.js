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
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
};
