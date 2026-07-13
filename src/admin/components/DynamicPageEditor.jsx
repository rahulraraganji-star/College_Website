import SectionEditor from "./SectionEditor";

const DynamicPageEditor = ({
  sections,
  setSections,
}) => {

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
    <div className="space-y-6">

      {sections.map((section, index) => (

        <SectionEditor
          key={index}
          section={section}
          onChange={(updatedSection) =>
            updateSection(index, updatedSection)
          }
          onDelete={() =>
            deleteSection(index)
          }
          onMoveUp={() =>
            moveUp(index)
          }
          onMoveDown={() =>
            moveDown(index)
          }
          onDuplicate={() =>
            duplicateSection(index)
          }
          isFirst={index === 0}
          isLast={index === sections.length - 1}
        />

      ))}

    </div>
  );
};

export default DynamicPageEditor;