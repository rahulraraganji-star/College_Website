import SectionCard from "../components/SectionCard";

const HeroEditor = ({
  section,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {

  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  return (

    <SectionCard
      title="Hero Section"
      icon="⭐"
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >

      {/* Heading */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-medium mb-2">
            Heading
          </label>

          <input
            type="text"
            value={section.heading || ""}
            onChange={(e)=>
              updateField(
                "heading",
                e.target.value
              )
            }
            placeholder="Enter heading"
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Hero Height
          </label>

          <select
            value={section.height || "medium"}
            onChange={(e)=>
              updateField(
                "height",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          >

            <option value="small">
              Small
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="large">
              Large
            </option>

            <option value="fullscreen">
              Full Screen
            </option>

          </select>

        </div>

      </div>

      {/* Sub Heading */}

      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Sub Heading
        </label>

        <textarea
          rows={4}
          value={section.subheading || ""}
          onChange={(e)=>
            updateField(
              "subheading",
              e.target.value
            )
          }
          placeholder="Enter sub heading"
          className="w-full border rounded-xl px-4 py-3 resize-none"
        />

      </div>

      {/* Alignment */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div>

          <label className="block text-sm font-medium mb-2">
            Text Alignment
          </label>

          <select
            value={section.alignment || "center"}
            onChange={(e)=>
              updateField(
                "alignment",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          >

            <option value="left">
              Left
            </option>

            <option value="center">
              Center
            </option>

            <option value="right">
              Right
            </option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Overlay Opacity
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={section.overlay || 40}
            onChange={(e)=>
              updateField(
                "overlay",
                Number(e.target.value)
              )
            }
            className="w-full"
          />

          <div className="text-sm text-gray-500 mt-2">

            {section.overlay || 40}%

          </div>

        </div>

      </div>

      {/* CTA */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div>

          <label className="block text-sm font-medium mb-2">
            Button Text
          </label>

          <input
            value={section.buttonText || ""}
            onChange={(e)=>
              updateField(
                "buttonText",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Learn More"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Button Link
          </label>

          <input
            value={section.buttonLink || ""}
            onChange={(e)=>
              updateField(
                "buttonLink",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
            placeholder="/about"
          />

        </div>

      </div>

      {/* Background */}

      <div className="mt-8">

        <label className="block text-sm font-medium mb-3">
          Background Image
        </label>

        <div className="border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center text-gray-500">

          <div className="text-5xl mb-4">

            🖼️

          </div>

          <div className="font-medium">

            Click or Drag Image Here

          </div>

          <div className="text-sm mt-2">

            Upload functionality will be added next

          </div>

        </div>

      </div>

    </SectionCard>

  );

};

export default HeroEditor;