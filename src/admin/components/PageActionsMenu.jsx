import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const PageActionsMenu = ({
  onEdit,
  onDuplicate,
  onTogglePublish,
  onDelete,
  isPublished,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-lg z-50">
          <button
            onClick={onEdit}
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
          >
            ✏️ Edit
          </button>

          <button
            onClick={onDuplicate}
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
          >
            📄 Duplicate
          </button>

          <button
            onClick={onTogglePublish}
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
          >
            {isPublished ? "🙈 Unpublish" : "👁 Publish"}
          </button>

          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PageActionsMenu;