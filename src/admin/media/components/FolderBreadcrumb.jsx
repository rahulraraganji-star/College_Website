import { ChevronRight, House } from "lucide-react";

const FolderBreadcrumb = ({
  folders = [],
  onNavigate,
}) => {

  return (

    <nav
      className="
        flex
        items-center
        flex-wrap
        gap-2
        text-sm
        text-gray-600
      "
    >

      {/* Root */}

      <button
        type="button"
        onClick={() => onNavigate?.(null)}
        className="
          flex
          items-center
          gap-1
          hover:text-black
          transition
        "
      >

        <House size={16} />

        <span>Media</span>

      </button>

      {folders.map((folder, index) => (

        <div
          key={folder.id || index}
          className="
            flex
            items-center
            gap-2
          "
        >

          <ChevronRight
            size={16}
            className="text-gray-400"
          />

          <button
            type="button"
            onClick={() =>
              onNavigate?.(folder)
            }
            className="
              hover:text-black
              transition
            "
          >

            {folder.name}

          </button>

        </div>

      ))}

    </nav>

  );

};

export default FolderBreadcrumb;