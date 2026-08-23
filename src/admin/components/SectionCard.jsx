import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

const SectionCard = ({
  title,
  children,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
  isCollapsed,
  onToggleCollapse,
  onToggleAll,
  allCollapsed,
  editable = true,
  showNumber = true,
  extraHeaderActions = null,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed =
    isCollapsed !== undefined
      ? isCollapsed
      : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse(index);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Friendly section names
  const getSectionTitle = (type) => {
    const map = {
      hero: "Hero Banner",
      eventsMarquee: "Scrolling Text",
      heroSection2: "Learning Spaces",
      eventsSection: "Events",
      coreStrengths: "Core Strengths",
      notices: "Notices",
      richText: "Rich Text",
      gallery: "Gallery",
      documents: "Documents",
      faculty: "Faculty",
      timeline: "Timeline",
      table: "Table",
      layout: "Layout",
      list: "List",
      grid: "Grid",
    };

    return map[type] || type;
  };

  const displayTitle = getSectionTitle(title);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="px-5 py-4 flex items-center justify-between select-none">
        
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Number */}
          {showNumber && typeof index === "number" && (
            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 text-[11px] font-semibold">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}

          {/* Divider */}
          {showNumber && (
            <span className="w-px h-5 bg-neutral-200 shrink-0" />
          )}

          {/* Title */}
          <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-800 truncate">
            {displayTitle}
          </h2>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Extra Actions */}
          {extraHeaderActions && (
            <>
              <div className="flex items-center gap-1">
                {extraHeaderActions}
              </div>

              <span className="w-px h-5 bg-neutral-200 mx-1" />
            </>
          )}

          {/* Move Up */}
          {editable && (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Move up"
              className={`p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition ${
                isFirst ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ArrowUp size={15} />
            </button>
          )}

          {/* Move Down */}
          {editable && (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              title="Move down"
              className={`p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition ${
                isLast ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ArrowDown size={15} />
            </button>
          )}

          {/* Edit */}
          {editable && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit section"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
            >
              <Pencil size={15} />
            </button>
          )}

          {/* Duplicate */}
          {editable && onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate section"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
            >
              <Copy size={15} />
            </button>
          )}

          {/* Delete */}
          {editable && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete section"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Divider */}
          <span className="w-px h-5 bg-neutral-200 mx-1" />

          {/* Collapse / Expand */}
          <button
            type="button"
            onClick={handleToggle}
            title={collapsed ? "Expand section" : "Collapse section"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {/* Collapse All - only on first section */}
          {index === 0 && onToggleAll && (
            <>
              <span className="w-px h-5 bg-neutral-200 mx-1" />

              <button
                type="button"
                onClick={onToggleAll}
                title={allCollapsed ? "Expand all sections" : "Collapse all sections"}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition flex items-center gap-1.5"
              >
                <ChevronsUpDown size={14} />
                <span className="text-[11px] font-medium text-neutral-500">
                  {allCollapsed ? "Expand All" : "Collapse All"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* BODY */}
      {!collapsed && (
        <div className="border-t border-neutral-100">
          <div className="p-6 bg-white">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCard;