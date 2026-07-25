import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { useInView } from "../hooks/useInView";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const GalleryImage = ({ image, index, onClick }) => {
  const [ref, inView] = useInView();

  if (!image.media?.url) return null;

  return (
    <div
      ref={ref}
      className={`break-inside-avoid mb-6 group transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        transitionDelay: inView
          ? `${Math.min(index, 6) * 70}ms`
          : "0ms",
      }}
    >
      <div 
        className="overflow-hidden bg-[#2A2623]/5 cursor-pointer"
        onClick={() => onClick(index)}
      >
        <img
          src={image.media.url}
          alt={image.alt || image.media?.alt || ""}
          className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {(image.caption || image.alt) && (
        <div className="pt-3">
          {image.caption && (
            <p className="font-['Inter'] font-medium text-sm text-[#2A2623]">
              {image.caption}
            </p>
          )}

          {image.alt && (
            <p className="text-sm font-['Inter'] text-[#2A2623]/50 mt-0.5">
              {image.alt}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const GalleryGrid = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, i) => (
        <div
          key={i}
          className="group overflow-hidden rounded-2xl bg-[#2A2623]/5 cursor-pointer"
          onClick={() => onImageClick(i)}
        >
          <img
            src={image.media.url}
            alt={image.alt || image.media?.alt || ""}
            className="w-full h-64 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {(image.caption || image.alt) && (
            <div className="p-4">
              {image.caption && (
                <p className="font-['Inter'] font-medium text-sm text-[#2A2623]">
                  {image.caption}
                </p>
              )}
              {image.alt && (
                <p className="text-sm font-['Inter'] text-[#2A2623]/50 mt-0.5">
                  {image.alt}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const GallerySlider = ({ images, onImageClick }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
        {images.map((image, i) => (
          <div
            key={i}
            className="min-w-[280px] md:min-w-[350px] lg:min-w-[400px] snap-start group cursor-pointer"
            onClick={() => onImageClick(i)}
          >
            <div className="overflow-hidden rounded-2xl bg-[#2A2623]/5">
              <img
                src={image.media.url}
                alt={image.alt || image.media?.alt || ""}
                className="w-full h-72 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
            {(image.caption || image.alt) && (
              <div className="pt-3">
                {image.caption && (
                  <p className="font-['Inter'] font-medium text-sm text-[#2A2623]">
                    {image.caption}
                  </p>
                )}
                {image.alt && (
                  <p className="text-sm font-['Inter'] text-[#2A2623]/50 mt-0.5">
                    {image.alt}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const GalleryMasonry = ({ images, onImageClick }) => {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
      {images.map((image, i) => (
        <GalleryImage key={i} image={image} index={i} onClick={onImageClick} />
      ))}
    </div>
  );
};

const GallerySection = ({ section }) => {
  const images = section.images || [];
  if (images.length === 0) return null;

  const layout = section.layout || "grid";

  // Lightbox state
  const [slides, setSlides] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const handleImageClick = (clickedIndex) => {
    setSlides(
      images.map((img) => ({
        src: img.media.url,
        alt: img.alt || img.media?.alt || "",
      }))
    );
    setIndex(clickedIndex);
    setOpen(true);
  };

  const renderGallery = () => {
    switch (layout) {
      case "slider":
        return <GallerySlider images={images} onImageClick={handleImageClick} />;
      case "masonry":
        return <GalleryMasonry images={images} onImageClick={handleImageClick} />;
      case "grid":
      default:
        return <GalleryGrid images={images} onImageClick={handleImageClick} />;
    }
  };

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Gallery" title={section.title} />
      
      {section.description && (
        <p className="max-w-2xl text-[#2A2623]/70 leading-7 mb-10">
          {section.description}
        </p>
      )}

      {renderGallery()}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </section>
  );
};

export default GallerySection;