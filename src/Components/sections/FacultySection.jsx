import { useEffect, useRef } from "react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import FacultyCard from "./FacultyCard";

const FacultySection = ({ section }) => {
  const departments = section.departments || [];

  if (departments.length === 0) return null;

  const facultyListRefs = useRef([]);

  useEffect(() => {
    const lists = facultyListRefs.current;

    const handleWheel = (e) => {
      const list = e.currentTarget;
      
      // Check if the list has horizontal scroll
      const hasHorizontalScroll = list.scrollWidth > list.clientWidth;
      if (!hasHorizontalScroll) {
        // Allow page scroll if no horizontal content
        return;
      }

      // Get the delta values
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      // If user is intentionally scrolling horizontally (trackpad),
      // let it happen naturally
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX !== 0) {
        return;
      }

      // Check if we can scroll
      const maxScrollLeft = list.scrollWidth - list.clientWidth;
      const canScrollRight = list.scrollLeft < maxScrollLeft;
      const canScrollLeft = list.scrollLeft > 0;

      // Determine scroll direction
      let shouldIntercept = false;
      let scrollAmount = 0;

      if (deltaY > 0 && canScrollRight) {
        // Scrolling down -> move right
        shouldIntercept = true;
        scrollAmount = Math.min(deltaY, 60); // Cap at 60px
      } else if (deltaY < 0 && canScrollLeft) {
        // Scrolling up -> move left
        shouldIntercept = true;
        scrollAmount = Math.max(deltaY, -60); // Cap at -60px
      }

      if (shouldIntercept) {
        e.preventDefault();
        list.scrollLeft += scrollAmount;
        // Add smooth scrolling
        list.style.scrollBehavior = 'smooth';
      }
    };

    // Also handle mouse drag for better UX
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const handleMouseDown = (e) => {
      const list = e.currentTarget;
      if (list.scrollWidth > list.clientWidth) {
        isDragging = true;
        startX = e.pageX;
        startScrollLeft = list.scrollLeft;
        list.style.cursor = 'grabbing';
        list.style.scrollBehavior = 'auto';
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const list = e.currentTarget;
      const dx = e.pageX - startX;
      list.scrollLeft = startScrollLeft - dx;
    };

    const handleMouseUp = (e) => {
      if (isDragging) {
        isDragging = false;
        const list = e.currentTarget;
        list.style.cursor = 'grab';
        list.style.scrollBehavior = 'smooth';
      }
    };

    const handleMouseLeave = (e) => {
      if (isDragging) {
        isDragging = false;
        const list = e.currentTarget;
        list.style.cursor = 'grab';
        list.style.scrollBehavior = 'smooth';
      }
    };

    lists.forEach((list) => {
      if (list) {
        // Check if list has horizontal scroll
        const hasScroll = list.scrollWidth > list.clientWidth;
        if (hasScroll) {
          list.style.cursor = 'grab';
        }
        
        list.addEventListener("wheel", handleWheel, { passive: false });
        list.addEventListener("mousedown", handleMouseDown);
        list.addEventListener("mousemove", handleMouseMove);
        list.addEventListener("mouseup", handleMouseUp);
        list.addEventListener("mouseleave", handleMouseLeave);
      }
    });

    return () => {
      lists.forEach((list) => {
        if (list) {
          list.removeEventListener("wheel", handleWheel);
          list.removeEventListener("mousedown", handleMouseDown);
          list.removeEventListener("mousemove", handleMouseMove);
          list.removeEventListener("mouseup", handleMouseUp);
          list.removeEventListener("mouseleave", handleMouseLeave);
          
          // Reset cursor
          list.style.cursor = 'auto';
          list.style.scrollBehavior = 'smooth';
        }
      });
    };
  }, [departments.length]);

  return (
    <section className="w-full min-w-0 overflow-x-clip pt-20 md:pt-24 border-t border-[#2A2623]/10">

      <SectionHeading
        eyebrow="Faculty"
        title={section.title}
      />

      <div className="w-full min-w-0 space-y-16">

        {departments.map((department, dIndex) => (
          <Reveal key={department.id || dIndex}>

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
              <div className="faculty-list-wrapper">

                <div
                  ref={(el) => {
                    facultyListRefs.current[dIndex] = el;
                  }}
                  className="faculty-list"
                >
                  {(department.members || []).map((member, mIndex) => (
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

            </div>

          </Reveal>
        ))}

      </div>

    </section>
  );
};

export default FacultySection;