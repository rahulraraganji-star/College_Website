import { useEffect, useState, useRef } from "react";

import {
  Users,
  BadgeCheck,
  UserCheck,
  Layers,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

/* 🔁 map string → icon */
const iconMap = {
  Users,
  BadgeCheck,
  UserCheck,
  Layers,
  GraduationCap,
  CheckCircle2,
};

function useCountUp(target, isVisible, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible || target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setValue(Math.floor(progress * target));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, isVisible, duration]);

  return value;
}

// UPDATED: Mobile typography made bolder and slightly larger
function StatItem({ icon, value, label, isVisible, mobile = false }) {
  const Icon = iconMap[icon] || Users;

  const isNumeric = /^[0-9]+/.test(value);
  const numericValue = isNumeric ? parseInt(value, 10) : 0;

  const count = useCountUp(numericValue, isVisible);

  return (
    <div
      className={`
        flex items-center gap-3
        ${mobile ? "py-2" : "p-5 sm:p-6"}
      `}
    >
      <div
        className={`
          flex items-center justify-center
          rounded-xl bg-[#2C2623] text-white
          ${mobile ? "h-12 w-12" : "h-10 w-10"}
        `}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        {/* MOBILE VALUE: Bolder, slightly larger */}
        <div
          className={`
            font-serif
            font-semibold
            leading-none
            text-[#171717]
            ${mobile ? "text-[1.15rem]" : "text-2xl"}
          `}
        >
          {isNumeric ? `${count}${value.replace(/[0-9]/g, "")}` : value}
        </div>

        {/* MOBILE LABEL: Heavier font weight */}
        <div
          className={`
            mt-1
            font-medium
            leading-tight
            text-[#5F5F5F]
            ${mobile ? "text-[13px]" : "text-sm"}
          `}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export default function CoreStrengths({ data }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const stats = data?.stats || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!stats.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#F8F4EC] via-[#FBF8F2] to-[#FFFDF9]"
    >
      {/* background effects - Updated colors for desktop */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#D4A13D]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#E8D8B3]/35 blur-3xl" />

      {/* ================= MOBILE LAYOUT ================= */}
      <div className="lg:hidden mx-auto max-w-6xl">
        <div className="px-5 pt-8 pb-16">
          
          <p className="text-[13px] font-semibold tracking-[0.28em] text-slate-600">
            {data.tag}
          </p>

          <h2
            className="
              mt-5
              max-w-[12ch]
              font-serif
              text-[44px]
              leading-[1.02]
              tracking-[-0.035em]
              text-[#1E1A17]
            "
          >
            {data.title}
          </h2>

          <p
            className="
              mt-5
              max-w-[310px]
              text-[16px]
              leading-7
              text-slate-600
            "
          >
            {data.description}
          </p>

          <div className="mt-10 relative rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            
            {/* Updated Parent Alignment: items-start instead of items-center */}
            <div className="flex items-start justify-between px-6 py-5">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  At a glance
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Metrics that reflect learning quality
                </div>
              </div>

              {/* Updated compact badge with fixed 96px width */}
              <div
                className="
                  flex
                  h-6
                  w-[96px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#2F2926]
                  text-[9px]
                  font-semibold
                  leading-none
                  text-white
                "
              >
                Updated regularly
              </div>
            </div>

            <div className="mx-6 h-px bg-slate-200" />

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-6 py-5">
              {stats.map((stat, i) => (
                <StatItem
                  key={i}
                  {...stat}
                  mobile={true}
                  isVisible={isVisible}
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>

        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (100% UNTOUCHED) ================= */}
      <div className="hidden lg:block mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">

          {/* LEFT */}
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-600">
              {data.tag}
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {data.title}
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              {data.description}
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#ECE2CF] bg-[#FFFDF9] px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
              <span />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl border border-[#ECE2CF] bg-[#FFFDF9] shadow-lg backdrop-blur">

              <div className="flex items-center justify-between gap-4 border-b border-[#ECE2CF] px-6 py-5">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    At a glance
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Metrics that reflect learning quality
                  </div>
                </div>

                <div className="hidden sm:block rounded-full bg-[#2F2926] px-4 py-2 text-xs font-semibold tracking-wide text-white">
                  Updated regularly
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-[#ECE2CF] sm:grid-cols-2 sm:divide-x sm:divide-y-0">

                <div className="sm:border-r sm:border-[#ECE2CF]">
                  {stats.slice(0, 3).map((stat, i) => (
                    <StatItem key={i} {...stat} isVisible={isVisible} />
                  ))}
                </div>

                <div>
                  {stats.slice(3, 6).map((stat, i) => (
                    <StatItem key={i} {...stat} isVisible={isVisible} />
                  ))}
                </div>

              </div>

              <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}