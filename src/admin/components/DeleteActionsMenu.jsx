import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Trash2,
} from "lucide-react";

const DeleteActionsMenu = ({
  onDelete,
  align = "right"
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      {/* THREE DOT */}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="
          p-1
          rounded-full
          bg-white
          shadow
          hover:bg-gray-100
          transition
        "
      >
        <MoreVertical size={18} />
      </button>

      {/* MENU */}

      {open && (
       <div
  className={`
    absolute
    ${align === "left" ? "left-0" : "right-0"}
    top-full
    mt-2
    z-[9999]
    w-48
    overflow-hidden
    rounded-xl
    border
    border-gray-200
    bg-white
    shadow-xl
  `}
  onClick={(e) => e.stopPropagation()}
>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete?.();
            }}
            className="
              flex
              w-full
              items-center
              gap-3
              px-4
              py-3
              text-sm
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            <Trash2
              size={16}
              strokeWidth={2}
            />

            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteActionsMenu;