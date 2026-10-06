import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

const UploadDropzone = ({
  accept = "*",
  multiple = true,
  onFilesSelected,
}) => {

  const inputRef = useRef(null);

  const [dragging, setDragging] =
    useState(false);

  const handleFiles = (files) => {
    if (!files || !files.length) return;

    onFilesSelected?.(Array.from(files));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
    if (!dragging) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          cursor-pointer
          border-2
          border-dashed
          rounded-2xl
          p-12
          transition-all
          duration-200
          text-center
          ${
            dragging
              ? "border-black bg-gray-100"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }
        `}
      >
        <div className="pointer-events-none select-none">
          <UploadCloud
            size={56}
            className="mx-auto text-gray-500"
          />

          <h3 className="mt-5 text-lg font-semibold">
            Drag & Drop Files
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            or click to browse
          </p>

          <div className="mt-5">
            <button
              type="button"
              tabIndex={-1}
              className="
                bg-black
                text-white
                px-5
                py-2.5
                rounded-lg
                hover:bg-gray-800
              "
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;