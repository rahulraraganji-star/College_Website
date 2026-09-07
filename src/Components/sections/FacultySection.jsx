import { useEffect, useRef } from "react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import FacultyCard from "./FacultyCard";

const DepartmentFacultyList = ({ department }) => {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let isDragging = false;
    let wheelTimeout = null;

    // --- WHEEL / TRACKPAD HORIZONTAL SCROLL HANDLER ---
    const handleWheel = (e) => {
      const maxScrollLeft = list.scrollWidth - list.clientWidth;
      if (maxScrollLeft <= 0) return; // Content fits, allow default vertical page scrolling

      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      // Let native horizontal trackpad gesture or Shift + wheel handle naturally
      if (Math.abs(deltaX) > Math.abs(deltaY) || e.shiftKey) {
        return;
      }

      const canScrollRight = list.scrollLeft < maxScrollLeft - 1;
      const canScrollLeft = list.scrollLeft > 1;

      // Scrolling down advances right, scrolling up advances left
      if ((deltaY > 0 && canScrollRight) || (deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        // Temporarily disable smooth scroll & snap animation fight during continuous wheel ticks
        list.style.scrollBehavior = "auto";
        list.scrollLeft += deltaY;

        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          if (list) {
            list.style.scrollBehavior = "smooth";
          }
        }, 150);
      }
    };

    // --- MOUSE DRAG SCROLL HANDLERS ---
    const handlePointerDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const maxScrollLeft = list.scrollWidth - list.clientWidth;
      if (maxScrollLeft <= 0) return;

      isPointerDown = true;
      isDragging = false;
      startX = e.pageX;
      startScrollLeft = list.scrollLeft;
    };

    const handlePointerMove = (e) => {
      if (!isPointerDown) return;
      const dx = e.pageX - startX;

      if (!isDragging && Math.abs(dx) > 5) {
        isDragging = true;
        list.classList.add("is-dragging");
        list.style.scrollBehavior = "auto";
        list.style.scrollSnapType = "none";
        try {
          list.setPointerCapture(e.pointerId);
        } catch {
          // ignore if capture is unsupported or fails
        }
      }

      if (isDragging) {
        e.preventDefault();
        list.scrollLeft = startScrollLeft - dx;
      }
    };

    const handlePointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (isDragging) {
        isDragging = false;
        list.classList.remove("is-dragging");
        list.style.scrollBehavior = "smooth";
        list.style.scrollSnapType = "";
        if (list.hasPointerCapture(e.pointerId)) {
          try {
            list.releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }
        }

        // Prevent accidental link/button click on drag release
        const preventClick = (clickEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          list.removeEventListener("click", preventClick, true);
        };
        list.addEventListener("click", preventClick, true);
        setTimeout(() => {
          list.removeEventListener("click", preventClick, true);
        }, 100);
      }
    };

    const handlePointerCancel = handlePointerUp;

    list.addEventListener("wheel", handleWheel, { passive: false });
    list.addEventListener("pointerdown", handlePointerDown);
    list.addEventListener("pointermove", handlePointerMove);
    list.addEventListener("pointerup", handlePointerUp);
    list.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      clearTimeout(wheelTimeout);
      list.removeEventListener("wheel", handleWheel);
      list.removeEventListener("pointerdown", handlePointerDown);
      list.removeEventListener("pointermove", handlePointerMove);
      list.removeEventListener("pointerup", handlePointerUp);
      list.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [department]);

  const members = department.members || [];

  return (
    <div className="faculty-list-wrapper">
      <div
        ref={listRef}
        className="faculty-list"
        tabIndex={0}
        aria-label={`${department.name || "Department"} faculty members`}
      >
        {members.map((member, mIndex) => (
          <div
            key={member.id || mIndex}
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
  const departments = section.departments || [];

  if (departments.length === 0) return null;

  return (
    <section className="w-full min-w-0 pt-20 md:pt-24 border-t border-[#2A2623]/10">

      <SectionHeading
        eyebrow="Faculty"
        title={section.title}
      />

      <div className="w-full min-w-0 space-y-16">

        {departments.map((department, dIndex) => (
          <Reveal key={department.id || dIndex} className="w-full min-w-0">

            <div className="w-full min-w-0 space-y-8">

              {/* Department heading */}
              <div className="flex items-center gap-4 border-b border-[#2A2623]/10 pb-3">

                <span className="w-6 h-[2px] bg-[#C9A555]" />

                <h3 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                  {department.name}
                </h3>

                <span className="ml-auto font-['IBM_Plex_Mono'] text-xs uppercase tracking-wide text-[#2A2623]/40">
                  {(department.members || []).length} Members
                </span>

              </div>

              {/* Faculty carousel */}
              <DepartmentFacultyList department={department} />

            </div>

          </Reveal>
        ))}

      </div>

    </section>
  );
};

export default FacultySection;