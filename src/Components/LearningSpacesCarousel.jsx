import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import image from "../assets/image.png";

const slides = [
  {
    title: "Library & Resources",
    desc: "Our library is a central hub for learning and research, offering an extensive collection of books, academic journals, and digital resources. It provides students with a quiet and well-organized environment to study",
    image,
  },
  {
    title: "Modern Learning Spaces",
    desc: "Our library is a central hub for learning and research, offering an extensive collection of books, academic journals, and digital resources. It provides students with a quiet and well-organized environment to study",
    image,
  },
  {
    title: "Modern Spaces",
    desc: "Our library is a central hub for learning and research, offering an extensive collection of books, academic journals, and digital resources. It provides students with a quiet and well-organized environment to study",
    image,
  },
];

export default function HeroSection() {
  const DURATION = 4.5;

  const [index, setIndex] = useState(0);

  const imageRef = useRef(null);
  const textRef = useRef(null);

 
  const barFillRef = useRef(null);
  const progressTweenRef = useRef(null);

  const startProgress = () => {
    progressTweenRef.current?.kill();
    if (!barFillRef.current) return;

    gsap.set(barFillRef.current, { scaleX: 0, transformOrigin: "left center" });

    progressTweenRef.current = gsap.to(barFillRef.current, {
      scaleX: 1,
      duration: DURATION,
      ease: "none",
    });
  };

  useEffect(() => {
    startProgress();

    const interval = setInterval(() => {
      gsap.to([imageRef.current, textRef.current], {
        opacity: 0,
        y: 14,
        duration: 0.4,
        onComplete: () => {
          setIndex((prev) => (prev + 1) % slides.length);

          gsap.fromTo(
            [imageRef.current, textRef.current],
            { opacity: 0, y: -14 },
            { opacity: 1, y: 0, duration: 0.5 }
          );
        },
      });
    }, DURATION * 1000);

    return () => {
      clearInterval(interval);
      progressTweenRef.current?.kill();
    };
   
  }, []);

  useEffect(() => {
    startProgress();
    
  }, [index]);

  return (
    <section className="relative overflow-hidden bg-[#FBFAF7]">
      

      <div className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* LEFT */}
          <div className="order-2 lg:order-1">
          
            <div className="relative mt-16 sm:mt-20 lg:mt-40">
              <img
                ref={imageRef}
                src={slides[index].image}
                alt={slides[index].title}
                className="h-[300px] w-full rounded-3xl object-cover
                           shadow-[0_30px_80px_rgba(0,0,0,0.20)]
                           sm:h-[380px]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-black/12 via-transparent to-white/10" />
            </div>

          
            <div className="mt-6 flex items-center gap-2">
              {slides.map((_, i) => {
                const isActive = i === index;

                return (
                  <div
                    key={i}
                    className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-black/10"
                  >
                  
                    {i < index ? (
                      <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                    ) : null}

                    
                    {isActive ? (
                      <div className="absolute inset-0">
                        <div
                          ref={barFillRef}
                          className="h-full w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                          style={{
                            transform: "scaleX(0)",
                            transformOrigin: "left center",
                          }}
                        />
                      
                        <div className="pointer-events-none absolute inset-0 opacity-60 blur-[6px]">
                          <div className="h-full w-full bg-gradient-to-r from-yellow-300/40 to-amber-400/40" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-black/5 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Built for focus & outcomes
            </div>

            <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight text-gray-900 sm:text-[54px]">
              Learning spaces that
              <br className="hidden sm:block" />
              inspire success
            </h1>

            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-gray-600 sm:text-[17px]">
              We believe education is more than just classrooms — it’s about
              creating opportunities and inspiring innovation.
            </p>

         
            <div
              ref={textRef}
              className="mt-10 rounded-2xl bg-white/55 p-6 backdrop-blur
                         shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                         ring-1 ring-black/5"
            >
              <h3 className="font-serif text-xl text-gray-900 sm:text-2xl">
                {slides[index].title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
                {slides[index].desc}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 shadow-sm transition hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300/60 active:translate-y-[1px]">
                Explore More <span aria-hidden>→</span>
              </button>

              <button className="inline-flex items-center justify-center rounded-xl bg-transparent px-6 py-3 font-semibold text-gray-900 ring-1 ring-black/15 transition hover:bg-white/50">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
