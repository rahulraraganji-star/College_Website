import Reveal from "./Reveal";

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
      <section className="relative px-6 md:px-0 pb-16 md:pb-20">
        <div className="w-full max-w-3xl">
          {/* Kicker */}
          {(number || kicker) && (
            <div
              className="
                mb-4
                font-['Inter']
                text-[13px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#8A6B3F]
              "
            >
              {number && <span>{number}</span>}
              {number && kicker && <span className="mx-2 text-[#8A6B3F]/50">—</span>}
              {kicker && <span>{kicker}</span>}
            </div>
          )}

          {/* Heading */}
          {heading && (
            <h2
              className="
                mb-8
                font-['Fraunces']
                italic
                text-[32px]
                md:text-[38px]
                font-medium
                leading-[1.1]
                tracking-[-0.01em]
                text-[#2A2623]
              "
              style={{ fontVariationSettings: "'wght' 500, 'SOFT' 40, 'WONK' 0" }}
            >
              {heading}
            </h2>
          )}

          {/* Body content */}
          {blocks.map((block, index) => {
            const paragraphs = (block.content || "")
              .split(/\n+/)
              .filter((p) => p.trim());

            return (
              <div key={index} className="mb-6 space-y-6 last:mb-0">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="
                      whitespace-pre-wrap
                      font-['Inter']
                      text-[16px]
                      md:text-[17px]
                      leading-8
                      font-normal
                      text-[#5C554C]
                    "
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          })}

          {/* Quote */}
          {quote && (
            <blockquote
              className="
                mt-10
                mb-10
                border-l-2
                border-[#C9A555]
                pl-6
                font-['Fraunces']
                italic
                text-[19px]
                md:text-[21px]
                leading-[1.5]
                text-[#2A2623]
              "
            >
              "{quote}"
            </blockquote>
          )}

          {/* Stats row */}
          {stats.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-12 gap-y-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div
                    className="
                      font-['Fraunces']
                      text-[30px]
                      md:text-[34px]
                      font-medium
                      leading-none
                      text-[#2A2623]
                    "
                  >
                    {stat.value}
                  </div>
                  <div
                    className="
                      mt-2
                      font-['Inter']
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-[#8A6B3F]
                    "
                  >
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