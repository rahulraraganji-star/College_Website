import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "./Button";

export default function HeroSection({ data }) {
  const DURATION = 4.5;
  const [index, setIndex] = useState(0);

  const imageRef = useRef(null);
  const textRef = useRef(null);
  const barFillRef = useRef(null);
  const progressTweenRef = useRef(null);

  const slides = data?.slides || [];

  const getImage = () => {
    const image = slides[index]?.image;
    return image?.url || image || "";
  };

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
    if (!slides.length) return;

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
  }, [slides.length]);

  useEffect(() => {
    startProgress();
  }, [index]);

  if (!slides.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#FBFAF7]">
      <div className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <div className="relative mt-16 sm:mt-20 lg:mt-40">
              <img
                ref={imageRef}
                src={getImage()}
                alt={slides[index]?.title || ""}
                className="h-[300px] w-full rounded-3xl object-cover shadow-[0_30px_80px_rgba(0,0,0,0.20)] sm:h-[380px]"
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
              {slides.map((_, i) => {
                const isActive = i === index;

                return (
                  <div
                    key={i}
                    className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-black/10"
                  >
                    {i < index && (
                      <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                    )}

                    {isActive && (
                      <div className="absolute inset-0">
                        <div
                          ref={barFillRef}
                          className="h-full w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-black/5 backdrop-blur">
              <span />
              {data.badge}
            </div>

            <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight text-gray-900 sm:text-[54px]">
              {data.title}
            </h1>

            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-gray-600 sm:text-[17px]">
              {data.subtitle}
            </p>

            <div
              ref={textRef}
              className="mt-10 rounded-2xl bg-white/55 p-6 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              <h3 className="font-serif text-xl text-gray-900 sm:text-2xl">
                {slides[index]?.title}
              </h3>

              <p className="mt-3 text-[15px] text-gray-600">
                {slides[index]?.desc}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                label={data.primaryButton}
                href={data.primaryButtonLink}
                bgColor="#D4A13D"
                textColor="#fff"
                rounded="rounded-xl"
                padding="px-7 py-3.5"
                fontWeight="font-semibold"
              />
              {data.secondaryButton && (
                <Button
                  label={data.secondaryButton}
                  href={data.secondaryButtonLink}
                  bgColor="transparent"
                  textColor="#111"
                  rounded="rounded-xl"
                  padding="px-7 py-3.5"
                  fontWeight="font-semibold"
                  className="
                    border border-gray-300
                    hover:bg-black
                    hover:text-white
                    hover:border-black
                  "
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}