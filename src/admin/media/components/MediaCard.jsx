import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Check,
} from "lucide-react";
import DeleteActionsMenu from "../../components/DeleteActionsMenu";

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return "";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1);

  return `${formatted} ${units[unitIndex]}`;
};

const MediaCard = ({
  media,
  selected = false,
  onSelect,
  onDelete,
}) => {

  const displayName = media.originalName || media.filename;

  const displaySize =
    typeof media.size === "number"
      ? formatFileSize(media.size)
      : media.size;

  const getIcon = () => {
    switch (media.type) {
      case "image":
        return <Image size={28} />;
      case "pdf":
      case "document":
        return <FileText size={28} />;
      case "video":
        return <Video size={28} />;
      case "audio":
        return <Music size={28} />;
      case "archive":
        return <Archive size={28} />;
      default:
        return <File size={28} />;
    }
  };

  return (
    <div
      onClick={() => onSelect?.(media)}
      className={`
        group
        cursor-pointer
        rounded-xl
        overflow-visible
        border
        bg-white
        transition-all
        duration-200
        hover:shadow-lg
        hover:-translate-y-1
        ${
          selected
            ? "border-black ring-2 ring-black"
            : "border-gray-200"
        }
      `}
    >
      {/* Preview */}
      <div
        className="
          relative
          aspect-square
          bg-gray-100
          flex
          items-center
          justify-center
        "
      >
        {media.type === "image" &&
        media.url ? (
          <img
            src={media.url}
            alt={
              media.alt ||
              media.originalName ||
              media.filename
            }
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
            className="
              w-full
              h-full
              object-cover
            "
          />
        ) : (
          <div className="text-gray-400">
            {getIcon()}
          </div>
        )}

        {/* Selected */}
        {selected && (
          <div
            className="
              absolute
              top-3
              right-3
              bg-black
              text-white
              rounded-full
              p-1
            "
          >
            <Check size={16} />
          </div>
        )}

        {/* Menu */}
        <div
          className="
            absolute
            top-3
            left-3
            opacity-0
            group-hover:opacity-100
            transition
          "
        >
          <DeleteActionsMenu
  align="left"
  onDelete={() => onDelete?.(media)}
/>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="
            font-medium
            truncate
          "
          title={displayName}
        >
          {displayName}
        </h3>

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            text-xs
            text-gray-500
          "
        >
          <span className="uppercase">
            {media.type}
          </span>

          <span>
            {displaySize}
          </span>
        </div>

        {media.width &&
          media.height && (
          <div
            className="
              mt-2
              text-xs
              text-gray-400
            "
          >
            {media.width} × {media.height}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCard;