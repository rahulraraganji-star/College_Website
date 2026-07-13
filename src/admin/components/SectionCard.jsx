const SectionCard = ({
  title,
  icon,
  children,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">

        <div className="flex items-center gap-3">

          <div className="text-2xl">
            {icon}
          </div>

          <h3 className="font-semibold text-lg">
            {title}
          </h3>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className={`px-3 py-2 rounded-lg border transition ${isFirst
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100"
              }`}
          >
            ↑
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className={`px-3 py-2 rounded-lg border transition ${isLast
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100"
              }`}
          >
            ↓
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>

        </div>

      </div>

      {/* Body */}

      <div className="p-6">

        {children}

      </div>

    </div>
  );
};

export default SectionCard;