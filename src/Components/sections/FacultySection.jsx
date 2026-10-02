import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import FacultyCard from "./FacultyCard";

const slugify = (text) =>
  (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const tokenize = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const findMatchingDepartmentIndex = (departments, rawTarget) => {
  if (!rawTarget || !Array.isArray(departments) || departments.length === 0) return -1;
  const target = rawTarget.toLowerCase().trim().replace(/^dept-/, "");
  const targetNorm = target.replace(/[^a-z0-9]/g, "");

  // 1. Direct ID match
  const idxById = departments.findIndex(
    (d) => String(d.id || d._id) === target
  );
  if (idxById !== -1) return idxById;

  // 2. Direct slug match
  const idxBySlug = departments.findIndex(
    (d) => slugify(d.name) === target || slugify(d.name).replace(/-/g, "") === targetNorm
  );
  if (idxBySlug !== -1) return idxBySlug;

  // 3. Known programme / department aliases
  // BCA
  if (target === "bca" || targetNorm === "bca") {
    const idx = departments.findIndex((d) => {
      const tokens = tokenize(d.name);
      return (
        tokens.includes("bca") ||
        (tokens.includes("computer") && tokens.includes("applications"))
      );
    });
    if (idx !== -1) return idx;
  }

  // B.Com / Commerce
  if (
    target === "commerce" ||
    target === "bcom" ||
    targetNorm === "bcom" ||
    targetNorm === "commerce"
  ) {
    const idx = departments.findIndex((d) => {
      const tokens = tokenize(d.name);
      return tokens.includes("commerce") || tokens.includes("bcom");
    });
    if (idx !== -1) return idx;
  }

  // B.A. / Arts / Humanities
  if (
    target === "ba" ||
    targetNorm === "ba" ||
    target === "arts" ||
    target === "humanities"
  ) {
    const idx = departments.findIndex((d) => {
      const tokens = tokenize(d.name);
      return (
        tokens.includes("humanities") ||
        tokens.includes("arts") ||
        tokens.includes("english") ||
        tokens.includes("economics") ||
        tokens.includes("history") ||
        tokens.includes("sociology") ||
        tokens.includes("political")
      );
    });
    if (idx !== -1) return idx;
  }

  // 4. Token substring matching
  const targetTokens = tokenize(target).filter((t) => t.length > 2);
  if (targetTokens.length > 0) {
    const idx = departments.findIndex((d) => {
      const deptTokens = tokenize(d.name);
      return targetTokens.some((tt) => deptTokens.includes(tt));
    });
    if (idx !== -1) return idx;
  }

  // 5. Partial name contains
  const idxContains = departments.findIndex((d) =>
    d.name && d.name.toLowerCase().includes(target)
  );
  if (idxContains !== -1) return idxContains;

  return -1;
};

const DepartmentFacultyList = ({ department }) => {
  const members = department.members || department.faculty || [];

  if (members.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <div className="faculty-grid-layout">
        {members.map((member, mIndex) => (
          <div
            key={member.id || member._id || mIndex}
            className="faculty-slide"
          >
            <FacultyCard
              member={{
                ...member,
                department: department.name,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const FacultySection = ({ section }) => {
  const departments = useMemo(() => section?.departments || [], [section?.departments]);
  const location = useLocation();
  const [highlightedDeptIndex, setHighlightedDeptIndex] = useState(null);
  const deptRefs = useRef({});

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const deptParam = searchParams.get("dept");
    const hashParam = location.hash ? location.hash.replace(/^#/, "") : null;
    const target = deptParam || hashParam;

    if (!target || departments.length === 0) return;

    const matchedIdx = findMatchingDepartmentIndex(departments, target);
    if (matchedIdx === -1) return;

    const matchedDept = departments[matchedIdx];
    const deptKey = matchedDept.id || matchedDept._id || matchedIdx;

    const performScroll = () => {
      const el = deptRefs.current[deptKey];
      if (!el) return;

      const navbarOffset = 100;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - navbarOffset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });

      setHighlightedDeptIndex(matchedIdx);
      setTimeout(() => {
        setHighlightedDeptIndex(null);
      }, 3000);
    };

    // Attempt immediately and retry shortly after in case of dynamic image/layout load
    const frameId = requestAnimationFrame(performScroll);
    const timerId = setTimeout(performScroll, 350);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [location.search, location.hash, departments]);

  if (departments.length === 0) return null;

  return (
    <section className="w-full min-w-0 pt-16 md:pt-20 border-t border-[#2A2623]/10">

      <SectionHeading
        eyebrow="Faculty"
        title={section.title}
      />

      <div className="w-full min-w-0 space-y-20 md:space-y-24">

        {departments.map((department, dIndex) => {
          const members = department.members || department.faculty || [];
          const deptKey = department.id || department._id || dIndex;
          const deptSlug = slugify(department.name);
          const isHighlighted = highlightedDeptIndex === dIndex;

          return (
            <Reveal key={deptKey} className="w-full min-w-0">

              <div
                ref={(el) => {
                  deptRefs.current[deptKey] = el;
                }}
                id={`dept-${deptSlug}`}
                data-department-name={department.name}
                className="w-full min-w-0 space-y-10 scroll-mt-28"
              >

                {/* Department heading */}
                <div
                  className={`flex items-center gap-4 border-b pb-4 transition-all duration-700 ${
                    isHighlighted
                      ? "border-[#C9A555]"
                      : "border-[#2A2623]/10"
                  }`}
                >

                  <span
                    className={`h-[2px] rounded-full transition-all duration-700 ease-out ${
                      isHighlighted ? "w-16 bg-[#C9A555]" : "w-8 bg-[#C9A555]"
                    }`}
                  />

                  <h3
                    className={`font-['Fraunces'] text-2xl sm:text-3xl font-medium tracking-tight transition-colors duration-500 ${
                      isHighlighted ? "text-[#171717]" : "text-[#2A2623]"
                    }`}
                  >
                    {department.name}
                  </h3>

                  {isHighlighted && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-wider text-[#8A6B3F] bg-[#8A6B3F]/10 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555] animate-pulse" />
                      Department
                    </span>
                  )}

                  <span className="ml-auto font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-[#8A6B3F] bg-[#8A6B3F]/10 px-3 py-1 rounded-full">
                    {members.length} {members.length === 1 ? "Member" : "Members"}
                  </span>

                </div>

                {/* Faculty grid */}
                <DepartmentFacultyList department={department} />

              </div>

            </Reveal>
          );
        })}

      </div>

    </section>
  );
};

export default FacultySection;