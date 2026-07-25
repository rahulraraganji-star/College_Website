import SectionCard from "../components/SectionCard";
import MediaPicker from "../media/components/MediaPicker";

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

  /* ==========================================
      UPDATE FIELD
  ========================================== */

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

      {/* ======================================
          HEADING
      ====================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div>

          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

            Heading

          </label>

          <input
            type="text"
            value={section.heading || ""}
            onChange={(e) =>
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
            onChange={(e) =>
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

      {/* ======================================
          SUB HEADING
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

          Sub Heading

        </label>

        <textarea
          rows={4}
          value={section.subheading || ""}
          onChange={(e) =>
            updateField(
              "subheading",
              e.target.value
            )
          }
          placeholder="Enter sub heading"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
        />

      </div>

      {/* ======================================
          LAYOUT
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

          Text Alignment

        </label>

        <select
          value={section.alignment || "center"}
          onChange={(e) =>
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

      {/* ======================================
          OVERLAY
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

          Overlay Opacity

        </label>

        <input
          type="range"
          min="0"
          max="100"
          value={section.overlay ?? 40}
          onChange={(e) =>
            updateField(
              "overlay",
              Number(e.target.value)
            )
          }
          className="w-full accent-gray-900"
        />

        <div className="text-sm text-gray-500 mt-2">

          {section.overlay ?? 40}%

        </div>

      </div>

      {/* ======================================
          BUTTONS
      ====================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Primary Button */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">

          <h4 className="text-sm font-semibold mb-4">
            Primary Button
          </h4>

          <div className="space-y-4">

            <div>

              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

                Button Text

              </label>

              <input
                value={section.primaryButtonText || ""}
                onChange={(e) =>
                  updateField(
                    "primaryButtonText",
                    e.target.value
                  )
                }
                placeholder="Learn More"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />

            </div>

            <div>

              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

                Button Link

              </label>

              <input
                value={section.primaryButtonLink || ""}
                onChange={(e) =>
                  updateField(
                    "primaryButtonLink",
                    e.target.value
                  )
                }
                placeholder="/about"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />

            </div>

          </div>

        </div>

        {/* Secondary Button */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">

          <h4 className="text-sm font-semibold mb-4">
            Secondary Button
          </h4>

          <div className="space-y-4">

            <div>

              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

                Button Text

              </label>

              <input
                value={section.secondaryButtonText || ""}
                onChange={(e) =>
                  updateField(
                    "secondaryButtonText",
                    e.target.value
                  )
                }
                placeholder="Contact Us"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />

            </div>

            <div>

              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">

                Button Link

              </label>

              <input
                value={section.secondaryButtonLink || ""}
                onChange={(e) =>
                  updateField(
                    "secondaryButtonLink",
                    e.target.value
                  )
                }
                placeholder="/contact"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          BACKGROUND IMAGE
      ====================================== */}

      <div className="mt-8">

        <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">

          Background Image

        </label>

        <MediaPicker
          type="image"
          multiple={false}
          value={section.background || null}
          onChange={(media) =>
            updateField(
              "background",
              media
            )
          }
        />

      </div>

    </SectionCard>

  );

};

export default HeroEditor;