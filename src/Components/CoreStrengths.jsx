import { useEffect, useState, useRef } from "react";

import {
  Users,
  BadgeCheck,
  UserCheck,
  Layers,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

/* ðŸ” map string â†’ icon */
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

function StatItem({ icon, value, label, isVisible }) {
  const Icon = iconMap[icon] || Users;

  const isNumeric = /^[0-9]+/.test(value);
  const numericValue = isNumeric ? parseInt(value, 10) : 0;

  const count = useCountUp(numericValue, isVisible);

  return (
    <div className="flex items-start gap-3 p-5 sm:p-6">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-900">
          {isNumeric ? `${count}${value.replace(/[0-9]/g, "")}` : value}
        </div>
        <div className="mt-1 text-sm font-medium text-slate-600">
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
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white"
    >
      {/* background effects */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
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

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
              <span /*className="h-2 w-2 rounded-full bg-amber-500"*/ />
            {/*  {data.badge}*/}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur">

              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    At a glance
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Metrics that reflect learning quality
                  </div>
                </div>

                <div className="hidden sm:block rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold tracking-wide text-white">
                  Updated regularly
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

                <div className="sm:border-r sm:border-slate-200">
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
