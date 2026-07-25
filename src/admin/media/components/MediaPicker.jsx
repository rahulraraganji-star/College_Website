import { ImagePlus, FileText } from "lucide-react";
import { useState } from "react";

import ImagePreview from "./ImagePreview";
import MediaModal from "../pages/MediaModal";

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
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {value.map((media) => (
              type === "image" ? (
                <img
                  key={media._id}
                  src={media.url}
                  alt=""
                  className="h-28 w-full rounded-xl object-cover border"
                />
              ) : (
                <div
                  key={media._id}
                  className="border rounded-xl p-4 flex flex-col items-center justify-center h-28"
                >
                  <FileText className="w-8 h-8 text-gray-500" />
                  <p className="mt-2 text-xs text-center truncate w-full">
                    {media.originalName}
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
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="font-medium">{value.originalName}</p>
                  <p className="text-sm text-gray-500">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
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