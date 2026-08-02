import MediaPicker from "../media/components/MediaPicker";

const HomeHeroEditor = ({ section, onChange }) => {

  const updateField = (key, value) => {
    onChange({
      ...section,
      [key]: value,
    });
  };

  const slides = section.slides || [];

  const updateSlide = (index, key, value) => {
    const updated = [...slides];
    updated[index][key] = value;

    updateField("slides", updated);
  };

  const addSlide = () => {
    updateField("slides", [
      ...slides,
      {
        image: "",
        caption: "",
        description: "",
      },
    ]);
  };

  const deleteSlide = (index) => {
    if (!window.confirm("Delete this slide?")) return;

    updateField(
      "slides",
      slides.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-8">

      {/* Hero Title */}

      <div>
        <label className="block text-sm font-semibold mb-2">
          Hero Title
        </label>

        <input
          value={section.title || ""}
          onChange={(e) =>
            updateField("title", e.target.value)
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* Button */}

      <div>
        <label className="block text-sm font-semibold mb-2">
          Button Text
        </label>

        <input
          value={section.buttonText || ""}
          onChange={(e) =>
            updateField("buttonText", e.target.value)
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* Slides */}

      <div className="space-y-6">

        {slides.map((slide, index) => (

          <div
            key={index}
            className="border rounded-2xl p-6 bg-white"
          >

            <div className="flex justify-between items-center mb-5">

              <h3 className="font-semibold">
                Slide {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => deleteSlide(index)}
                className="text-red-500"
              >
                Delete
              </button>

            </div>

            <MediaPicker
              type="image"
              value={slide.image || null}
              onChange={(media) =>
                updateSlide(index, "image", media)
              }
            />

            <div className="mt-5">

              <label className="block text-sm font-semibold mb-2">
                Caption
              </label>

              <input
                value={slide.caption || ""}
                onChange={(e) =>
                  updateSlide(index, "caption", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <div className="mt-5">

              <label className="block text-sm font-semibold mb-2">
                Description
              </label>

              <textarea
                rows={4}
                value={slide.description || ""}
                onChange={(e) =>
                  updateSlide(index, "description", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

          </div>

        ))}

      </div>

      <button
        type="button"
        onClick={addSlide}
        className="px-5 py-3 bg-black text-white rounded-xl"
      >
        + Add Slide
      </button>

    </div>
  );
};

export default HomeHeroEditor;