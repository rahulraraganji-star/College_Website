const ImagePreview = ({
  image,
  onReplace,
  onRemove,
}) => {

  if (!image) {

    return (

      <div
        className="
          border-2
          border-dashed
          border-gray-300
          rounded-xl
          p-10
          text-center
          bg-gray-50
        "
      >

        <div className="text-5xl mb-3">
          🖼️
        </div>

        <h3 className="font-semibold text-lg">
          No image selected
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Choose an image from the Media Library.
        </p>

      </div>

    );

  }

  const displayUrl = typeof image === "string" ? image : image?.url;
  const displayName =
    typeof image === "string"
      ? image.split("/").pop()?.split("?")[0] || "Selected Image"
      : image?.filename || image?.originalName || image?.alt || "Selected Image";

  return (
    <div
      className="
        border
        border-gray-200
        rounded-xl
        overflow-hidden
        bg-white
        shadow-sm
      "
    >
      {/* IMAGE */}
      <div className="aspect-video bg-gray-100">
        <img
          src={displayUrl}
          alt={displayName}
          className="
            w-full
            h-full
            object-cover
          "
        />
      </div>

      {/* INFO */}
      <div className="p-4 space-y-2">
        <div>
          <h4
            className="
              font-medium
              text-gray-900
              truncate
            "
          >
            {displayName}
          </h4>

          <p className="text-sm text-gray-500">
            {image?.width &&
              image?.height &&
              `${image.width} × ${image.height}`}

            {image?.width &&
              image?.height &&
              image?.size &&
              " • "}

            {image?.size &&
              (typeof image.size === "number"
                ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                : image.size)}
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex gap-3 pt-2">

          <button
            type="button"
            onClick={onReplace}
            className="
              flex-1
              border
              rounded-lg
              py-2
              hover:bg-gray-100
              transition
            "
          >

            Replace

          </button>

          <button
            type="button"
            onClick={onRemove}
            className="
              flex-1
              bg-red-500
              text-white
              rounded-lg
              py-2
              hover:bg-red-600
              transition
            "
          >

            Remove

          </button>

        </div>

      </div>

    </div>

  );

};

export default ImagePreview;