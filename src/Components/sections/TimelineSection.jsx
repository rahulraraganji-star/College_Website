import SectionHeading from "./SectionHeading";
import { useInView } from "../hooks/useInView";

const TimelineEvent = ({ event, index }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`relative pl-8 sm:pl-12 transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
      }`}
      style={{ transitionDelay: inView ? `${Math.min(index, 6) * 80}ms` : "0ms" }}
    >
      {/* Node Dot on Gold Spine */}
      <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#C9A555] border-4 border-[#F8F5F0] shadow-sm" />

      {/* Year Pill */}
      {event.year && (
        <span className="inline-block px-3 py-1 rounded-full bg-[#8A6B3F]/10 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-[#8A6B3F] mb-4">
          {event.year}
        </span>
      )}

      {/* Event Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white/80 border border-[#E6DED3] transition-all duration-300 hover:bg-white hover:border-[#C9A555] hover:shadow-[0_8px_30px_rgba(201,165,85,0.1)]">
        <div
          className={`grid ${
            event.image?.url ? "lg:grid-cols-[220px_1fr] gap-8 items-center" : "grid-cols-1"
          }`}
        >
          {/* Optional Image */}
          {event.image?.url && (
            <div className="overflow-hidden rounded-xl border border-[#E6DED3]">
              <img
                src={event.image.url}
                alt={event.image.alt || event.title || ""}
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col justify-center">
            <h3 className="font-['Fraunces'] text-[22px] sm:text-[26px] font-medium text-[#2A2623] tracking-tight">
              {event.title}
            </h3>
            {event.description && (
              <p className="mt-3 font-['Inter'] text-[15px] sm:text-[16px] leading-relaxed text-[#5C554C]">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineSection = ({ section }) => {
  const events = section.events || [];
  if (events.length === 0) return null;

  return (
    <section className="pt-16 md:pt-20 border-t border-[#E6DED3]">
      <SectionHeading eyebrow="Historical Journey" title={section.title || "Milestones & Heritage"} />
      <div className="relative border-l-2 border-[#C9A555]/40 ml-3 sm:ml-4 space-y-12 sm:space-y-16 pb-4">
        {events.map((event, i) => (
          <TimelineEvent key={i} event={event} index={i} />
        ))}
      </div>
    </section>
  );
};

export default TimelineSection;