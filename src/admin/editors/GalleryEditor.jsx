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
  // Helper to update section state
  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  // Gallery Management Functions
  const addGallery = () => {
    const galleries = [...(section.galleries || [])];
    galleries.push({
      title: `Gallery ${galleries.length + 1}`,
      description: "",
      layout: "grid",
      images: [],
    });
    onChange({
      ...section,
      galleries,
    });
  };

  const deleteGallery = (galleryIndex) => {
    const galleries = (section.galleries || []).filter(
      (_, i) => i !== galleryIndex
    );
    onChange({
      ...section,
      galleries,
    });
  };

  const updateGallery = (galleryIndex, field, value) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      [field]: value,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  // Image Management Functions for a specific gallery
  const addImage = (galleryIndex) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: [
        ...(galleries[galleryIndex].images || []),
        {
          media: null,
          caption: "",
          alt: "",
        },
      ],
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const updateImage = (galleryIndex, imageIndex, key, value) => {
    const galleries = [...(section.galleries || [])];
    const updatedImages = [...(galleries[galleryIndex].images || [])];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      [key]: value,
    };
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: updatedImages,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const updateImageWithMedia = (galleryIndex, imageIndex, media) => {
    const galleries = [...(section.galleries || [])];
    const updatedImages = [...(galleries[galleryIndex].images || [])];
    
    const updatedImage = {
      ...updatedImages[imageIndex],
      media,
    };

    // Auto-fill alt text if not already set
    if (!updatedImages[imageIndex].alt && media?.alt) {
      updatedImage.alt = media.alt;
    }

    updatedImages[imageIndex] = updatedImage;
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: updatedImages,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const deleteImage = (galleryIndex, imageIndex) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: (galleries[galleryIndex].images || []).filter(
        (_, i) => i !== imageIndex
      ),
    };
    onChange({
      ...section,
      galleries,
    });
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
      {/* Gallery Section Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Gallery Section Title
        </label>
        <input
          type="text"
          value={section.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
          placeholder="e.g., School Events"
        />
      </div>

      {/* Galleries */}
      <div className="space-y-12">
        {(section.galleries || []).map((gallery, galleryIndex) => (
          <div
            key={galleryIndex}
            className="border rounded-2xl p-8 bg-gray-50/50 relative"
          >
            {/* Gallery Header with Delete */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Fraunces'] text-2xl text-[#2A2623]">
                {gallery.title || `Gallery ${galleryIndex + 1}`}
              </h3>
              <button
                type="button"
                onClick={() => deleteGallery(galleryIndex)}
                className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
              >
                Delete Album
              </button>
            </div>

            {/* Gallery Title */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Album Title
              </label>
              <input
                type="text"
                value={gallery.title || ""}
                onChange={(e) =>
                  updateGallery(galleryIndex, "title", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
                placeholder="e.g., Annual Day 2026"
              />
            </div>

            {/* Gallery Description */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={gallery.description || ""}
                onChange={(e) =>
                  updateGallery(galleryIndex, "description", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 min-h-[80px] resize-y"
                placeholder="Describe this gallery album..."
              />
            </div>

            {/* Layout */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                Layout
              </label>
              <select
                value={gallery.layout || "grid"}
                onChange={(e) =>
                  updateGallery(galleryIndex, "layout", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="slider">Slider</option>
              </select>
            </div>

            {/* Images */}
            <div className="space-y-6">
              {(gallery.images || []).map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className="border rounded-2xl p-6 bg-white"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold">
                      Image {imageIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => deleteImage(galleryIndex, imageIndex)}
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
                        updateImageWithMedia(galleryIndex, imageIndex, media)
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
                          galleryIndex,
                          imageIndex,
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
                          galleryIndex,
                          imageIndex,
                          "alt",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl px-4 py-3"
                      placeholder="Enter alt text..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => addImage(galleryIndex)}
                className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
              >
                + Add Image
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Only one Add Gallery button here */}
      {(section.galleries || []).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500 mb-4">
            No gallery albums yet. Create your first one!
          </p>
          <button
            type="button"
            onClick={addGallery}
            className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
          >
            + Add Gallery Album
          </button>
        </div>
      )}
    </SectionCard>
  );
};

export default GalleryEditor;