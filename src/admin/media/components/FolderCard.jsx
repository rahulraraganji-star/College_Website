import { Folder } from "lucide-react";
import DeleteActionsMenu from "../../components/DeleteActionsMenu";

const FolderCard = ({
  folder,
  onOpen,
  onDelete,
}) => {

  return (

    <div
      onClick={() => onOpen?.(folder)}
      className="
        group
        cursor-pointer
        rounded-xl
        border
        border-gray-200
        bg-white
        hover:shadow-lg
        hover:-translate-y-1
        transition-all
        duration-200
        overflow-visible
      "
    >

      {/* Header */}

      <div
        className="
          relative
          flex
          items-center
          justify-center
          aspect-square
          bg-amber-50
        "
      >

        <Folder
          size={70}
          className="text-amber-500"
        />

        <div
          className="
    absolute
    top-3
    right-3
    opacity-0
    group-hover:opacity-100
    transition
  "
        >
          <DeleteActionsMenu
            onDelete={() => onDelete?.(folder)}
          />
        </div>

      </div>

      {/* Details */}

      <div className="p-4">

        <h3
          className="
            font-semibold
            truncate
          "
        >

          {folder.name}

        </h3>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >

          {folder.itemCount || 0} items

        </p>

        {folder.updatedAt && (

          <p
            className="
              text-xs
              text-gray-400
              mt-2
            "
          >

            Updated {folder.updatedAt}

          </p>

        )}

      </div>

    </div>

  );

};

export default FolderCard;