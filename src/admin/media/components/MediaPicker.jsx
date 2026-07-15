import { ImagePlus } from "lucide-react";
import { useState } from "react";

import ImagePreview from "./ImagePreview";
import MediaModal from "./MediaModal";

const MediaPicker = ({
  value,
  label = "Image",
  onChange,
}) => {

  const [open, setOpen] =
    useState(false);

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

      {!value && (

        <button
          type="button"
          onClick={() => setOpen(true)}
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

          <ImagePlus
            size={50}
            className="text-gray-400"
          />

          <div>

            <p className="font-medium">

              Select Image

            </p>

            <p className="text-sm text-gray-500">

              Choose from Media Library

            </p>

          </div>

        </button>

      )}

      {/* Preview */}

      {value && (

        <ImagePreview
          image={value}
          onReplace={() =>
            setOpen(true)
          }
          onRemove={removeImage}
        />

      )}

      {/* Modal */}

      {open && (

        <MediaModal
          onClose={() =>
            setOpen(false)
          }
          onSelect={handleSelect}
        />

      )}

    </div>

  );

};

export default MediaPicker;