import {
  FileText,
  Upload,
  Trash2,
} from "lucide-react";

const FilePicker = ({
  file,
  label = "Document",
  onPick,
  onRemove,
}) => {

  return (

    <div className="space-y-3">

      {/* Label */}

      <label className="block text-sm font-medium">

        {label}

      </label>

      {/* No File */}

      {!file && (

        <div
          className="
            border-2
            border-dashed
            rounded-xl
            p-8
            text-center
            bg-gray-50
          "
        >

          <FileText
            size={48}
            className="mx-auto text-gray-400"
          />

          <p className="mt-4 text-gray-500">

            No file selected

          </p>

          <button
            type="button"
            onClick={onPick}
            className="
              mt-5
              bg-black
              text-white
              px-5
              py-2.5
              rounded-lg
              flex
              items-center
              gap-2
              mx-auto
            "
          >

            <Upload size={18} />

            Choose File

          </button>

        </div>

      )}

      {/* Selected File */}

      {file && (

        <div
          className="
            border
            rounded-xl
            p-5
            flex
            justify-between
            items-center
            bg-white
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12
                rounded-lg
                bg-red-100
                flex
                items-center
                justify-center
              "
            >

              <FileText
                size={24}
                className="text-red-500"
              />

            </div>

            <div>

              <h4 className="font-medium">

                {file.filename}

              </h4>

              <p className="text-sm text-gray-500">

                {file.size}

              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={onPick}
              className="
                border
                px-4
                py-2
                rounded-lg
                hover:bg-gray-100
              "
            >

              Replace

            </button>

            <button
              type="button"
              onClick={onRemove}
              className="
                bg-red-500
                text-white
                p-2
                rounded-lg
                hover:bg-red-600
              "
            >

              <Trash2 size={18} />

            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default FilePicker;