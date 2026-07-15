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

    if (!files.length) return;

    onFilesSelected?.(
      Array.from(files)
    );

  };

  return (

    <div>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) =>
          handleFiles(e.target.files)
        }
      />

      <div
        onClick={() =>
          inputRef.current.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {

          e.preventDefault();

          setDragging(false);

          handleFiles(
            e.dataTransfer.files
          );

        }}
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

  );

};

export default UploadDropzone;