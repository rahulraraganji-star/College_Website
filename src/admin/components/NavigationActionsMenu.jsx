import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
} from "lucide-react";

const NavigationActionsMenu = ({
  onEdit,
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

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      {/* Three dots */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition"
      >
        <MoreVertical size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-52 rounded-xl border border-neutral-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* Edit */}
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default NavigationActionsMenu;