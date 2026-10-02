import { useState } from "react";
import SectionHeading from "./SectionHeading";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { getCleanImageUrl } from "../../utils/imageUrl";

const EventListSection = ({ section }) => {
  const [slides, setSlides] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const events = section.events || [];
  if (events.length === 0) return null;

  return (
    <section className="pt-14 sm:pt-18 md:pt-20 border-t border-[#E6DED3]">
      <SectionHeading eyebrow="College Events & Activities" title={section.title || "Upcoming & Recent Events"} />
      <div className="space-y-16">
        {events.map((event, i) => {
          return (
            <div
              key={i}
              className="pb-16 border-b border-[#E6DED3] last:border-none"
            >
              {/* Title */}
              <h3 className="font-['Fraunces'] text-2xl sm:text-3xl md:text-4xl font-medium text-[#2A2623]">
                {event.title}
              </h3>

              {/* Date + Location - Flex row */}
              <div className="flex flex-wrap gap-6 mt-3 text-sm text-[#8A6B3F] font-['IBM_Plex_Mono'] uppercase tracking-wide">
                {event.date && (
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {event.date}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="mt-6 text-[#2A2623]/70 leading-7 max-w-2xl">
                  {event.description}
                </p>
              )}

              {/* Category Badge */}
              {event.category && (
                <span className="inline-block mt-4 rounded-full bg-[#C9A555]/10 px-4 py-1.5 text-xs font-semibold text-[#8A6B3F]">
                  {event.category}
                </span>
              )}

              {/* Button */}
              {event.buttonText && event.buttonLink && (
                <a
                  href={event.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-[#8A6B3F] font-medium hover:gap-3 transition-all"
                >
                  {event.buttonText}
                  <ArrowRight size={16} />
                </a>
              )}

              {/* Event Gallery */}
              {event.images?.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {event.images.map((image, imageIndex) => (
                    <div
                      key={image._id || imageIndex}
                      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A555]/20"
                      style={{
                        boxShadow: '0 0 0 0px #C9A555',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 0 3px #C9A555, 0 8px 25px rgba(201, 165, 85, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 0 0px #C9A555';
                      }}
                    >
                      <img
                        src={getCleanImageUrl(image.url)}
                        alt={event.title}
                        className="w-full h-52 rounded-2xl object-cover cursor-pointer transition duration-300 hover:scale-105"
                        onError={(e) => {
                          if (!e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = "true";
                            e.currentTarget.src = "/uploads/event1.jpg";
                          }
                        }}
                        onClick={() => {
                          setSlides(
                            event.images.map((img) => ({
                              src: getCleanImageUrl(img.url),
                            }))
                          );
                          setIndex(imageIndex);
                          setOpen(true);
                        }}
                      />
                      
                      {/* Premium gold glow overlay - subtle */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(201, 165, 85, 0.08), rgba(201, 165, 85, 0.02))'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </section>
  );
};

export default EventListSection;