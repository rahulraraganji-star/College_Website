import SectionHeading from "./SectionHeading";

const EmbedSection = ({ section }) => {
  const src =
  section.embedType === "pdf"
    ? section.media?.url
    : section.url;

if (!src) return null;
  console.log("Embed Section:", section);
  console.log("Media:", section.media);
  console.log("Media URL:", section.media?.url);

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Media" title={section.title} />
      <div className="overflow-hidden border border-[#2A2623]/10">
        <iframe
          src={src}
          title={section.title || "Embedded Content"}
          width={section.responsive ? "100%" : section.width || "100%"}
          height={section.height || 500}
          loading={section.lazyLoad ? "lazy" : "eager"}
          allowFullScreen={section.allowFullscreen}
          className="border-0 w-full"
        />
      </div>
    </section>
  );
};

export default EmbedSection;
