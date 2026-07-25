import { useInView } from "../hooks/useInView";

/**
 * Wraps a block in a tasteful fade + slide-up, triggered once when it
 * scrolls into view. Respects prefers-reduced-motion.
 */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

export default Reveal;
