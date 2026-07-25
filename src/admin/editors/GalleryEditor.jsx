import SectionCard from "../components/SectionCard";
import MediaPicker from "../media/components/MediaPicker";

const GalleryEditor = ({
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

  const updateImages = (images) => {

    onChange({
      ...section,
      images,
    });

  };

  const addImage = () => {

    updateImages([
      ...(section.images || []),
      {
        media: null,
        caption: "",
        alt: "",
      },
    ]);

  };

  const updateImage = (
    index,
    key,
    value
  ) => {

    const images = [...section.images];

    images[index][key] = value;

    updateImages(images);

  };

  const updateImageWithMedia = (index, media) => {

    const images = [...section.images];

    images[index].media = media;

    // Auto-fill alt text if not already set
    if (!images[index].alt && media?.alt) {
      images[index].alt = media.alt;
    }

    updateImages(images);

  };

  const deleteImage = (index) => {

    updateImages(

      section.images.filter(
        (_, i) => i !== index
      )

    );

  };

  return (

    <SectionCard
      title="Gallery"
      icon="🖼️"
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >

      {/* Gallery Title */}

      <div className="mb-6">

        <label className="block text-sm font-medium mb-2">

          Gallery Title

        </label>

        <input
          type="text"
          value={section.title || ""}
          onChange={(e)=>
            updateField(
              "title",
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* Layout */}

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div>

          <label className="block text-sm font-medium mb-2">

            Layout

          </label>

          <select
            value={section.layout || "grid"}
            onChange={(e)=>
              updateField(
                "layout",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          >

            <option value="grid">

              Grid

            </option>

            <option value="masonry">

              Masonry

            </option>

            <option value="slider">

              Slider

            </option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">

            Columns

          </label>

          <select
            value={section.columns || 3}
            onChange={(e)=>
              updateField(
                "columns",
                Number(e.target.value)
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          >

            <option value={2}>2</option>

            <option value={3}>3</option>

            <option value={4}>4</option>

          </select>

        </div>

      </div>

      {/* Images */}

      <div className="space-y-6">

        {(section.images || []).map(

          (image, index) => (

            <div
              key={index}
              className="border rounded-2xl p-6 bg-gray-50"
            >

              <div className="flex items-center justify-between mb-6">

                <h4 className="font-semibold">

                  Image {index + 1}

                </h4>

                <button
                  type="button"
                  onClick={() =>
                    deleteImage(index)
                  }
                  className="text-red-500 hover:text-red-700 transition-colors"
                >

                  Delete

                </button>

              </div>

              {/* Media Picker */}

              <div className="mb-6">

                <MediaPicker
                  type="image"
                  multiple={false}
                  value={image.media}
                  onChange={(media) =>
                    updateImageWithMedia(index, media)
                  }
                />

              </div>

              {/* Caption */}

              <div className="mb-5">

                <label className="block text-sm font-medium mb-2">
                  Caption
                </label>

                <input
                  type="text"
                  value={image.caption || ""}
                  onChange={(e) =>
                    updateImage(
                      index,
                      "caption",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Enter caption..."
                />

              </div>

              {/* Alt Text */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Alt Text
                </label>

                <input
                  type="text"
                  value={image.alt || ""}
                  onChange={(e) =>
                    updateImage(
                      index,
                      "alt",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Enter alt text..."
                />

              </div>

            </div>

          )

        )}

      </div>

      {/* Add Image */}

      <div className="mt-8">

        <button
          type="button"
          onClick={addImage}
          className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
        >

          + Add Image

        </button>

      </div>

    </SectionCard>

  );

};

export default GalleryEditor;