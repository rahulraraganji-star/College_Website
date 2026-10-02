import { ImagePlus, FileText } from "lucide-react";
import { useState } from "react";

import ImagePreview from "./ImagePreview";
import MediaModal from "../pages/MediaModal";

const getDocumentName = (media) => {
  if (!media) return "";
  if (typeof media === "object") {
    return (
      media.originalName ||
      media.filename ||
      media.name ||
      (typeof media.url === "string" ? media.url.split("/").pop() : "Document")
    );
  }
  if (typeof media === "string") {
    const filename = media.split("/").pop();
    return filename ? decodeURIComponent(filename) : media;
  }
  return "Document";
};

const getDocumentSize = (media) => {
  if (!media || typeof media !== "object" || !media.size || isNaN(media.size)) {
    return null;
  }
  const mb = media.size / (1024 * 1024);
  if (mb < 0.1) {
    return `${(media.size / 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(2)} MB`;
};

const MediaPicker = ({
  value,
  label = "Image",
  type = "image",
  multiple = false,
  onChange,
}) => {

  const [open, setOpen] = useState(false);

  const handleSelect = (media) => {
    onChange?.(media);
    setOpen(false);
  };

  const removeImage = () => {
    onChange?.(null);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium">
        {label}
      </label>

      {/* Empty */}
      {(!value || (Array.isArray(value) && value.length === 0)) && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
          className="
            w-full
            border-2
            border-dashed
            rounded-xl
            p-10
            flex
            flex-col
            items-center
            justify-center
            gap-4
            hover:bg-gray-50
            transition
          "
        >
          {type === "image" ? (
            <ImagePlus size={50} className="text-gray-400" />
          ) : (
            <FileText size={50} className="text-gray-400" />
          )}

          <div>
            <p className="font-medium">
              Select {label}
            </p>
            <p className="text-sm text-gray-500">
              Choose {label.toLowerCase()} from Media Library
            </p>
          </div>
        </button>
      )}

      {/* Preview - Multiple */}
      {Array.isArray(value) ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {value.map((media, idx) => (
              type === "image" ? (
                <img
                  key={media._id || media.url || `media_img_${idx}`}
                  src={media.url}
                  alt=""
                  className="h-36 w-full rounded-xl object-cover border"
                />
              ) : (
                <div
                  key={media._id || media.url || `media_doc_${idx}`}
                  className="border rounded-xl p-4 flex flex-col items-center justify-center h-36"
                >
                  <FileText className="w-8 h-8 text-gray-500" />
                  <p className="mt-2 text-xs text-center truncate w-full" title={getDocumentName(media)}>
                    {getDocumentName(media)}
                  </p>
                </div>
              )
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-lg border"
            >
              Add / Replace {type === "image" ? "Images" : "Files"}
            </button>

            <button
              type="button"
              onClick={() => onChange([])}
              className="px-4 py-2 rounded-lg border text-red-600"
            >
              Remove All
            </button>
          </div>
        </div>
      ) : (
        /* Preview - Single */
        value && (
          type === "image" ? (
            <ImagePreview
              image={value}
              onReplace={() => setOpen(true)}
              onRemove={removeImage}
            />
          ) : (
            <div className="border rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[280px]" title={getDocumentName(value)}>
                    {getDocumentName(value)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getDocumentSize(value) || "PDF Document"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        )
      )}

      {/* Modal */}
      {open && (
        <MediaModal
          isOpen={open}
          type={type}
          multiple={multiple}
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default MediaPicker;