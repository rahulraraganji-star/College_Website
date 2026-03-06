import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "./Button";
import image from "../assets/image.png";
import scr from "../assets/scr.png";

const slides = [
  {
    image: scr,
    caption: "A campus designed for modern learning",
    description:
      "We believe education is more than just classrooms — it’s about creating opportunities, building character, and inspiring innovation.",
  },
  {
    image: scr,
    caption: "Where ideas grow into innovation",
    description:
      "Our institution nurtures creativity, collaboration, and critical thinking to prepare students for a a changing world through hands-on learning and research.",
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
  const descRef = useRef(null);
  const captionRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      gsap.to([imageRef.current, descRef.current], {
        opacity: 0,
        y: 20,
        duration: 0.4,
        onComplete: () => {
          setIndex((prev) => (prev + 1) % slides.length);

          gsap.fromTo(
            [imageRef.current, descRef.current],
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6 }
          );
        },
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1500px] mx-auto px-8 py-24 grid md:grid-cols-[1fr_1.4fr] gap-20 items-center">

        {/* LEFT TEXT */}
        <div>

          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">
            Empowering Minds. <br /> Building Futures
          </h1>

          <p
            ref={descRef}
            className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed"
          >
            {slides[index].description}
          </p>

          <div className="mt-8">
            <Button label="Browse Courses" />
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">

          <div
            ref={imageRef}
            className="rounded-3xl overflow-hidden shadow-xl"
          >
            <img
              src={slides[index].image}
              alt=""
              className="w-full h-[520px] object-cover"
            />
          </div>

          <p
            ref={captionRef}
            className="mt-4 text-center text-sm text-gray-500"
          >
            {slides[index].caption}
          </p>

        </div>

      </div>
    </section>
  );
};

export default Hero;