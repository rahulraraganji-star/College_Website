import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "./Button";
import image from '../assets/image.png'
import scr from '../assets/scr.png'


const slides = [
  {
    image: scr ,
    caption: "A campus designed for modern learning",
    description:
      "We believe education is more than just classrooms — it’s about creating opportunities, building character, and inspiring innovation.",
  },
  {
    image: scr,
    caption: "Where ideas grow into innovation",
    description:
      "Our institution nurtures creativity, collaboration, and critical thinking to prepare students for a changing world through hands-on learning and research.",
  },
  {
    image: image,
    caption: "Building futures beyond classrooms",
    description:
      "From academics to real-world exposure, we empower learners to lead with confidence, adaptability, and purpose in every field they pursue.",
  },
];

const Hero = () => {
  const imageRef = useRef(null);
  const captionRef = useRef(null);
  const descRef = useRef(null);
  const leftBlockRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // fade content out
      gsap.to(
        [imageRef.current, captionRef.current, descRef.current],
        {
          opacity: 0,
          y: 10,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            setIndex((prev) => (prev + 1) % slides.length);

            // animate height change smoothly
            gsap.fromTo(
              leftBlockRef.current,
              { height: leftBlockRef.current.offsetHeight },
              {
                height: "auto",
                duration: 0.45,
                ease: "power2.out",
              }
            );

            // fade content in
            gsap.fromTo(
              [imageRef.current, captionRef.current, descRef.current],
              { opacity: 0, y: -10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
              }
            );
          },
        }
      );
    }, 4800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div ref={leftBlockRef}>
          <h1 className="mt-8 text-4xl md:text-5xl font-Playfair Display font-serif text-gray-900 leading-tight">
            Empowering Minds. <br /> Building Futures
          </h1>

          <p
            ref={descRef}
            className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed"
          >
            {slides[index].description}
          </p>

          <Button label="Browse Courses" marginTop="mt-5" />
        </div>

        {/* Right Carousel */}
        <div className="flex justify-center md:justify-end">
          <div className="mt-16 max-w-md">
            <div
              ref={imageRef}
              className="rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={slides[index].image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <p
              ref={captionRef}
              className="mt-4 text-center text-sm text-gray-500 tracking-wide"
            >
              {slides[index].caption}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
