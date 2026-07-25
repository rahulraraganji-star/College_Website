import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import FacultyCard from "./FacultyCard";

const FacultySection = ({ section }) => {
  const departments = section.departments || [];
  if (departments.length === 0) return null;

  return (
    <section className="pt-20 md:pt-24 border-t border-[#2A2623]/10">
      <SectionHeading eyebrow="Faculty" title={section.title} />
      <div className="space-y-16">
        {departments.map((department, dIndex) => (
          <Reveal key={department.id || dIndex}>
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-[#2A2623]/10 pb-3">
                <span className="w-6 h-[2px] bg-[#C9A555]" />
                <h3 className="font-['Fraunces'] text-2xl font-medium text-[#2A2623]">
                  {department.name}
                </h3>
                <span className="ml-auto font-['IBM_Plex_Mono'] text-xs uppercase tracking-wide text-[#2A2623]/40">
                  {(department.members || []).length} Members
                </span>
              </div>
              <div
                className="grid gap-y-12 justify-center"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 340px))",
                  columnGap: "4rem",
                }}
              >
                {(department.members || []).map((member, mIndex) => (
                  <div
                    key={member.id || mIndex}
                    className="flex justify-center"
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
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FacultySection;