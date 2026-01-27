import { Outlet, NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/about/history", label: "History", icon: HistoryIcon },
  { to: "/about/vision-mission", label: "Vision & Mission", icon: SparkIcon },
  { to: "/about/principal-message", label: "Principal’s Message", icon: QuoteIcon },
  { to: "/about/management", label: "Management", icon: UsersIcon },
  { to: "/about/accreditation", label: "Accreditation & Certification", icon: BadgeIcon },
  { to: "/about/best-practices", label: "Best Practices", icon: CheckIcon },
  { to: "/about/distinctiveness", label: "Institutional Distinctiveness", icon: DiamondIcon },
  { to: "/about/development-plan", label: "Institutional Development Plan", icon: RoadmapIcon },
];

const SECTION_COPY = [
  { to: "/about/history", summary: "Milestones, legacy, and institutional evolution." },
  { to: "/about/vision-mission", summary: "Vision, mission, and educational direction." },
  { to: "/about/principal-message", summary: "Leadership message, priorities, and commitments." },
  { to: "/about/management", summary: "Governance, committees, and administrative structure." },
  { to: "/about/accreditation", summary: "Quality framework, certifications, and reviews." },
  { to: "/about/best-practices", summary: "Practices that improve learning and student outcomes." },
  { to: "/about/distinctiveness", summary: "Distinctive strengths and institutional identity." },
  { to: "/about/development-plan", summary: "Roadmap, initiatives, and continuous improvement plan." },
];

function getActiveMeta(pathname) {
  const nav = NAV.find((x) => pathname.startsWith(x.to));
  const copy = SECTION_COPY.find((x) => pathname.startsWith(x.to));
  return {
    label: nav?.label ?? "Overview",
    summary: copy?.summary ?? "Browse key institutional information in a clear, scannable format.",
  };
}

export default function Aboutus_Layout() {
  const { pathname } = useLocation();
  const meta = getActiveMeta(pathname);

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] text-neutral-900">
      {/* Premium light backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-[560px] w-[1060px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-200/55 via-white/70 to-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-44 right-[-220px] h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-fuchsia-200/20 via-cyan-200/30 to-white/45 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_720px_at_10%_-10%,rgba(255,255,255,0.96),rgba(255,255,255,0)),radial-gradient(900px_520px_at_90%_0%,rgba(255,214,148,0.55),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(to_right,rgba(17,24,39,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.65)_1px,transparent_1px)] [background-size:92px_92px]" />
      </div>

      {/* Header (improved spacing) */}
      <header className="z-40 border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-10">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6">
              <ol className="flex items-center gap-2">
                <li className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 ring-1 ring-black/10">
                    <HomeIcon className="h-4 w-4 text-neutral-700" />
                  </span>
                  <span className="font-medium">Home</span>
                </li>
                <li className="text-neutral-300">/</li>
                <li className="font-medium text-neutral-700">About</li>
                <li className="text-neutral-300">/</li>
                <li className="truncate text-neutral-600">{meta.label}</li>
              </ol>
            </nav>

            <div className="mt-4 flex items-start justify-between gap-8">
              <div className="min-w-0">
               <p className="text-[11px] font-semibold tracking-[0.32em] text-neutral-500 uppercase mb-3">
                  About
                </p>

               <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
                  <span className="  bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-500 bg-clip-text text-transparent">
                    About US
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm sm:text-base leading-6 text-neutral-600">
                  Explore our institution’s story, leadership, and quality initiatives.
                </p>

                {/* Chips (kept, but spaced better) */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Chip icon={SectionIcon} text={`Current: ${meta.label}`} />
                  <Chip icon={ClockIcon} text="Last updated: Jan 2026" />
                  <Chip icon={BookIcon} text="Reading time: 3–5 min" />
                  <Chip icon={ListIcon} text={`${NAV.length} sections`} />
                </div>
              </div>

        
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Overview / Context panel (now has a purpose) */}
        <div className="mb-8 rounded-[28px] p-[1px] bg-gradient-to-r from-amber-200/60 via-black/10 to-indigo-200/45 shadow-[0_30px_120px_-70px_rgba(0,0,0,0.25)]">
          <div className="rounded-[27px] bg-white/75 backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[27px] p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_10%_0%,rgba(255,211,120,0.30),rgba(255,255,255,0)),radial-gradient(900px_320px_at_95%_0%,rgba(99,102,241,0.16),rgba(255,255,255,0))]" />

              <div className="relative grid gap-6 lg:grid-cols-12 lg:items-start">
                {/* Left: context */}
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-neutral-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
                    <span className="font-medium">{meta.label}</span>
                  </div>

                  <h2 className="mt-3 text-lg sm:text-xl font-semibold text-neutral-900">
                    What you’ll find here
                  </h2>

                  <p className="mt-2 text-sm text-neutral-700 leading-6">
                    {meta.summary} Use this page as a quick reference—each section is written to be easy to scan.
                  </p>

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    <KeyItem icon={BadgeIconMini} text="Clear, section-wise information." />
                    <KeyItem icon={ShieldMiniIcon} text="Quality & governance highlights." />
                    <KeyItem icon={UsersMiniIcon} text="Leadership & management overview." />
                    <KeyItem icon={CheckMiniIcon} text="Practices and improvement focus." />
                  </ul>
                </div>

                {/* Right: structured guide \ */}
                <div className="lg:col-span-5 mt-13">
                  <div className="rounded-2xl border border-black/10 bg-white/70 shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-black/5 ring-1 ring-black/10">
                          <InfoIcon className="h-4 w-4 text-neutral-800" />
                        </span>
                        <p className="text-sm font-semibold text-neutral-900">Reading guide</p>
                      </div>
                      <span className="text-[11px] text-neutral-500">Best format</span>
                    </div>

                    <ol className="px-4 py-3 space-y-2">
                      <GuideRow icon={LinesIcon} title="Overview" desc="1–2 lines that set context." />
                      <GuideRow icon={BulletIcon} title="Bullets" desc="3–6 points for quick scanning." />
                      <GuideRow icon={CheckMiniIcon} title="Takeaways" desc="End with key points or outcomes." />
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-12 gap-8 lg:gap-10">
          {/* Sidebar  */}
     <aside className="col-span-12 md:col-span-4 lg:col-span-3">
  <div className="md:sticky md:top-24">
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            Sections
          </p>
          <span className="text-xs text-neutral-400">About</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-4 px-6 py-3",
                "text-sm transition-colors",
                isActive
                  ? "bg-amber-50 text-neutral-900 font-medium border-l-4 border-amber-500"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
              ].join(" ")
            }
          >
            {/* Icon */}
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100">
              <item.icon className="h-4 w-4 text-neutral-700" />
            </span>

            {/* Label */}
            <span className="flex-1 truncate">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

    </div>
  </div>
</aside>



          {/* Content */}
          <section className="col-span-12 md:col-span-8 lg:col-span-9">
            <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="border-b border-black/5 px-6 sm:px-10 py-6">
  <div className="flex items-center">
    <p className="text-sm text-neutral-600">
      {meta.label}
      <span className="mx-2 text-neutral-300">•</span>
      <span className="text-neutral-500">Scannable content</span>
    </p>
  </div>
</div>


              <div className="p-6 sm:p-10">
                <div className="max-w-3xl prose prose-neutral md:prose-lg prose-headings:scroll-mt-28 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-strong:text-neutral-900">
                  <Outlet />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* --- Small UI helpers --- */
function Chip({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-neutral-700">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-black/5 ring-1 ring-black/10">
        <Icon className="h-3.5 w-3.5 text-neutral-700" />
      </span>
      <span className="font-medium">{text}</span>
    </span>
  );
}

function KeyItem({ icon: Icon, text }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-black/5 ring-1 ring-black/10">
        <Icon className="h-4 w-4 text-neutral-800" />
      </span>
      <p className="text-sm text-neutral-700 leading-6">{text}</p>
    </li>
  );
}

function GuideRow({ icon: Icon, title, desc }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-black/5 ring-1 ring-black/10">
        <Icon className="h-4 w-4 text-neutral-800" />
      </span>
      <div className="leading-6">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-600">{desc}</p>
      </div>
    </li>
  );
}

/* --- Icon system --- */
function IconBase({ children, className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}
function ChevronRight({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function HomeIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M4 11l8-7 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20a1 1 0 001 1H10v-5a1 1 0 011-1h2a1 1 0 011 1v5h2.5a1 1 0 001-1v-9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function InfoIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 17v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8h.01" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6" />
    </IconBase>
  );
}
function LinesIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M6 7h12M6 12h10M6 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}
function BulletIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M9 7h10M9 12h10M9 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 7h.01M6.5 12h.01M6.5 17h.01" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </IconBase>
  );
}
function CheckMiniIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M20 7L10 17l-4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function ShieldMiniIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.6" />
    </IconBase>
  );
}
function UsersMiniIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M15.5 11a2.7 2.7 0 10-5.4 0 2.7 2.7 0 005.4 0z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 20c0-2.6-2.6-4.5-6-4.5S7 17.4 7 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconBase>
  );
}
function BadgeIconMini({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 3l2.5 2.5H18V9l2.5 2.5L18 14v3.5h-3.5L12 20l-2.5-2.5H6V14L3.5 11.5 6 9V5.5h3.5L12 3z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 12l1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function SectionIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}
function ClockIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" />
    </IconBase>
  );
}
function BookIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 00-2 2V4z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 19h12" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}
function ListIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </IconBase>
  );
}

/* --- Existing section icons (as before) --- */
function HistoryIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 12a9 9 0 11-3.3-6.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}
function SparkIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8l-1.2-4.2L6.6 7.4l4.2-1.2L12 2z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 14l.8 2.6L8.4 18l-2.6.8L5 21l-.8-2.6L1.6 18l2.6-.8L5 14z" stroke="currentColor" strokeWidth="1.4" />
    </IconBase>
  );
}
function QuoteIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M7.5 17c-1.7 0-3-1.3-3-3 0-2.8 1.6-4.9 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 17c-1.7 0-3-1.3-3-3 0-2.8 1.6-4.9 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}
function UsersIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M16 11a3 3 0 10-6 0 3 3 0 006 0z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20c0-3-3-5-7-5s-7 2-7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}
function BadgeIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4l3-3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 12l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function DiamondIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 2l6 7-6 13L6 9l6-7z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 9h12" stroke="currentColor" strokeWidth="1.6" />
    </IconBase>
  );
}
function RoadmapIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M6 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 8c3-2 6 2 9 0s3 0 3 0v8s0 0-3 2-6-2-9 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 5h0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </IconBase>
  );
}
