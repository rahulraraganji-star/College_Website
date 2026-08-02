import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

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
        <div className="absolute right-0 top-full mt-2 z-[9999] w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <button
            onClick={onEdit}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil size={16} strokeWidth={2} />
            Edit
          </button>

          <button
            onClick={onDuplicate}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Copy size={16} strokeWidth={2} />
            Duplicate
          </button>

          <button
            onClick={onTogglePublish}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            {isPublished ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <Eye size={16} strokeWidth={2} />
            )}

            {isPublished ? "Unpublish" : "Publish"}
          </button>

          <div className="mx-3 border-t border-gray-100" />

          <button
            onClick={onDelete}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} strokeWidth={2} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PageActionsMenu;