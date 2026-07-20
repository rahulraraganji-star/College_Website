import { useState } from "react";
import SectionCard from "../components/SectionCard";
import MediaModal from "../media/pages/MediaModal";

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

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  const handleSelectMedia = (media) => {
    updateField("background", {
      id: media._id,
      url: media.url,
      filename: media.originalName,
      alt: media.alt,
    });
    setIsMediaModalOpen(false);
  };

  const handleRemoveMedia = () => {
    updateField("background", null);
  };

  const background = section.background;

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

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
          />

        </div>

        <div>

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
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

        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
        />

      </div>

      {/* Alignment */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div>

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
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

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full accent-gray-900"
          />

          <div className="text-sm text-gray-500 mt-2">

            {section.overlay || 40}%

          </div>

        </div>

      </div>

      {/* CTA */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div>

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            placeholder="Learn More"
          />

        </div>

        <div>

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            placeholder="/about"
          />

        </div>

      </div>

      {/* Background */}

      <div className="mt-8">

        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Background Image
        </label>

        {background ? (

          <div className="border border-gray-200 rounded-xl overflow-hidden">

            <div className="relative h-52 bg-gray-50">

              <img
                src={background.url}
                alt={background.alt || background.filename || "Background"}
                className="w-full h-full object-cover"
              />

            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white">

              <span className="text-xs text-gray-500 truncate">
                {background.filename}
              </span>

              <div className="flex items-center gap-2 shrink-0">

                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="text-sm font-medium px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Replace Image
                </button>

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="text-sm font-medium px-3.5 py-2 rounded-lg border border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>

        ) : (

          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >

            <div className="text-4xl mb-3">

              🖼️

            </div>

            <div className="text-sm font-medium text-gray-700">

              No background image selected

            </div>

            <div className="mt-3 text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white">

              Choose Image

            </div>

          </button>

        )}

      </div>

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        type="image"
        multiple={false}
        onSelect={handleSelectMedia}
      />

    </SectionCard>

  );

};

export default HeroEditor;