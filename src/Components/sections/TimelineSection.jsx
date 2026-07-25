import SectionHeading from "./SectionHeading";
import { useInView } from "../hooks/useInView";

const TimelineEvent = ({ event, index }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`relative pl-10 md:pl-12 transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
      }`}
      style={{ transitionDelay: inView ? `${Math.min(index, 6) * 90}ms` : "0ms" }}
    >
      <span className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-[#C9A555] ring-4 ring-[#F8F5F0]" />
      {event.year && (
        <p className="font-['IBM_Plex_Mono'] text-2xl md:text-3xl font-medium text-[#8A6B3F] leading-none">
          {event.year}
        </p>
      )}
      <h3 className="mt-3 font-['Fraunces'] text-xl md:text-2xl font-medium text-[#2A2623]">
        {event.title}
      </h3>
      {event.description && (
        <p className="mt-3 font-['Inter'] text-[#2A2623]/70 leading-7 max-w-2xl">{event.description}</p>
      )}
    </div>
  );
};

const TimelineSection = ({ section }) => {
  const events = section.events || [];
  if (events.length === 0) return null;

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Timeline" title={section.title} />
      <div className="border-l border-[#2A2623]/15 space-y-14 md:space-y-16">
        {events.map((event, i) => (
          <TimelineEvent key={i} event={event} index={i} />
        ))}
      </div>
    </section>
  );
};

export default TimelineSection;
