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
      <span className="absolute left-0 top-2 w-3 h-3 rounded-full bg-[#C9A555] ring-4 ring-[#F8F5F0]" />
      
      {/* Year - moved above the entire event */}
      {event.year && (
        <p className="font-['IBM_Plex_Mono'] text-4xl text-[#8A6B3F] leading-none mb-6">
          {event.year}
        </p>
      )}
      
      <div
        className={`grid lg:grid-cols-[240px_1fr] gap-12 items-center ${
          index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Image */}
        {event.image?.url && (
          <div>
            <img
              src={event.image.url}
              alt={event.image.alt || event.title || ""}
              className="w-full h-40 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex flex-col justify-center h-full">
          <h3 className="font-['Fraunces'] text-3xl font-medium text-[#2A2623]">
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-4 max-w-xl leading-8 text-[#2A2623]/70">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TimelineSection = ({ section }) => {
  const events = section.events || [];
  if (events.length === 0) return null;

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Timeline" title={section.title} />
      <div className="border-l-2 border-[#C9A555]/30 space-y-24">
        {events.map((event, i) => (
          <TimelineEvent key={i} event={event} index={i} />
        ))}
      </div>
    </section>
  );
};

export default TimelineSection;