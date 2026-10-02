import Reveal from "./Reveal";
import RichTextRenderer from "./RichTextRenderer";
import { Quote } from "lucide-react";

const ContentSection = ({
  number,
  kicker,
  heading,
  blocks = [],
  quote,
  stats = [],
}) => {
  if (!heading && blocks.length === 0) return null;

  return (
    <Reveal>
      <section className="relative px-4 sm:px-6 md:px-0 pb-12 md:pb-16">
        <div className="w-full max-w-3xl">
          {/* Editorial Kicker */}
          {(number || kicker) && (
            <div className="mb-4 flex items-center gap-2 font-['IBM_Plex_Mono'] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6B3F]">
              {number && <span>{number}</span>}
              {number && kicker && <span className="text-[#8A6B3F]/40">—</span>}
              {kicker && <span>{kicker}</span>}
            </div>
          )}

          {/* Section Heading */}
          {heading && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-[2px] w-8 bg-[#C9A555] rounded-full" />
              </div>
              <h2
                className="font-['Fraunces'] text-[28px] sm:text-[34px] md:text-[38px] font-medium leading-[1.18] tracking-[-0.015em] text-[#2A2623]"
                style={{ fontVariationSettings: "'wght' 500, 'SOFT' 30, 'WONK' 0" }}
              >
                {heading}
              </h2>
            </div>
          )}

          {/* Body content with RichTextRenderer */}
          {blocks.map((block, index) => (
            <div key={block.id || index} className="mb-8 last:mb-0">
              <RichTextRenderer
                content={block.content}
                isFirstBlock={index === 0 && !heading}
              />
            </div>
          ))}

          {/* Editorial Quote */}
          {quote && (
            <div className="mt-10 mb-10 relative overflow-hidden rounded-2xl bg-[#FBF9F5] border-l-4 border-[#C9A555] p-6 sm:p-8 shadow-sm">
              <div className="absolute top-4 right-5 opacity-10 pointer-events-none text-[#8A6B3F]">
                <Quote size={56} />
              </div>
              <blockquote className="font-['Fraunces'] italic text-[19px] sm:text-[21px] md:text-[22px] leading-[1.6] text-[#2A2623] relative z-10">
                "{quote}"
              </blockquote>
            </div>
          )}

          {/* Stats row */}
          {stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E6DED3]">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/60 border border-[#E6DED3]/80">
                  <div className="font-['Fraunces'] text-[28px] md:text-[32px] font-medium leading-none text-[#2A2623]">
                    {stat.value}
                  </div>
                  <div className="mt-2 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6B3F]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
};

export default ContentSection;