import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SectionCard from "./SectionCard";
import SectionEditor from "./SectionEditor";

const DynamicPageEditor = ({
  sections,
  setSections,
  setShowSectionModal,
}) => {
  const [collapsedSections, setCollapsedSections] = useState({});

  const updateSection = (index, updatedSection) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
  };

  const deleteSection = (index) => {
    const newSections = sections.filter(
      (_, i) => i !== index
    );
    setSections(newSections);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    [
      newSections[index - 1],
      newSections[index],
    ] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
  };

  const moveDown = (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [
      newSections[index],
      newSections[index + 1],
    ] = [
      newSections[index + 1],
      newSections[index],
    ];
    setSections(newSections);
  };

  const duplicateSection = (index) => {
    const newSections = [...sections];
    newSections.splice(
      index + 1,
      0,
      structuredClone(sections[index])
    );
    setSections(newSections);
  };

  const toggleCollapse = (index) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAll = () => {
    // Check if all sections are collapsed
    const allCollapsed = sections.every((_, index) => collapsedSections[index] === true);
    
    // If all are collapsed, expand all; otherwise collapse all
    const newState = {};
    sections.forEach((_, index) => {
      newState[index] = !allCollapsed;
    });
    setCollapsedSections(newState);
  };

  // Check if all sections are collapsed
  const allCollapsed = sections.length > 0 && sections.every((_, index) => collapsedSections[index] === true);

  if (sections.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-12 text-center text-gray-500">
        No sections added yet.
        <br />
        Click <strong>Add Section</strong> to start building your page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Section and Toggle All buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-base font-semibold text-gray-900">
            Page Builder
          </h2>
          <span className="text-xs font-medium text-gray-400">
            {sections.length} Section{sections.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle All button */}
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-white bg-gray-900 hover:bg-black px-3 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            {allCollapsed ? (
              <>
                <span>Expand All</span>
                <ChevronDown size={14} />
              </>
            ) : (
              <>
                <span>Collapse All</span>
                <ChevronUp size={14} />
              </>
            )}
          </button>

          {/* Add Section button */}
          <button
            type="button"
            onClick={() => setShowSectionModal(true)}
            className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 shrink-0"
          >
            + Add Section
          </button>
        </div>
      </div>

      {sections.map((section, index) => (
        <SectionCard
          key={index}
          title={section.type}
          index={index}
          onDelete={() => deleteSection(index)}
          onMoveUp={() => moveUp(index)}
          onMoveDown={() => moveDown(index)}
          onDuplicate={() => duplicateSection(index)}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
          isCollapsed={collapsedSections[index] || false}
          onToggleCollapse={toggleCollapse}
        >
          <SectionEditor
            section={section}
            onChange={(updatedSection) =>
              updateSection(index, updatedSection)
            }
          />
        </SectionCard>
      ))}
    </div>
  );
};

export default DynamicPageEditor;