import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown
} from 'lucide-react';

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
  extraHeaderActions = null, // NEW: prop for custom header actions
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use external collapse state if provided, otherwise use internal
  const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse(index);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Map section types to friendly names
  const getSectionTitle = (type) => {
    const map = {
      hero: "Hero Banner",
      eventsMarquee: "Scrolling Text",
      heroSection2: "Learning Spaces",
      eventsSection: "Events",
      coreStrengths: "Core Strengths",
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
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/60 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Section Number - only shown when showNumber is true and index is a valid number */}
          {showNumber && typeof index === "number" && (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 ring-[3px] ring-gray-900/[0.06] text-white text-[11px] font-mono tracking-tight shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}

          <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">
            {displayTitle}
          </h3>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Collapse/Expand Button for individual section */}
          <button
            type="button"
            onClick={handleToggle}
            className="p-1.5 rounded-lg hover:bg-gray-200/70 transition"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Toggle All button - only show on the first section */}
          {index === 0 && onToggleAll && (
            <>
              <button
                type="button"
                onClick={onToggleAll}
                className="p-1.5 rounded-lg hover:bg-gray-200/70 transition flex items-center gap-1.5"
                aria-label={allCollapsed ? 'Expand All' : 'Collapse All'}
              >
                <ChevronsUpDown size={14} className="text-gray-500" />
                <span className="text-[11px] font-medium text-gray-500">
                  {allCollapsed ? 'Expand All' : 'Collapse All'}
                </span>
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
            </>
          )}

          {/* Extra Header Actions - rendered before existing buttons */}
          {extraHeaderActions && (
            <div className="flex items-center gap-0.5">
              {extraHeaderActions}
              <div className="w-px h-5 bg-gray-200 mx-1" />
            </div>
          )}

          {/* Editing buttons - only shown when editable is true */}
          {editable && (
            <>
              {/* Move Up */}
              <button
                type="button"
                disabled={isFirst}
                onClick={onMoveUp}
                className={`p-1.5 rounded-lg transition ${
                  isFirst
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-200/70"
                }`}
                aria-label="Move up"
              >
                <ArrowUp size={15} className="text-gray-500" />
              </button>

              {/* Move Down */}
              <button
                type="button"
                disabled={isLast}
                onClick={onMoveDown}
                className={`p-1.5 rounded-lg transition ${
                  isLast
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-200/70"
                }`}
                aria-label="Move down"
              >
                <ArrowDown size={15} className="text-gray-500" />
              </button>

              {/* Edit Button */}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-1.5 rounded-lg hover:bg-gray-200/70 transition"
                  aria-label="Edit"
                >
                  <Pencil size={15} className="text-gray-500" />
                </button>
              )}

              {/* Duplicate */}
              {onDuplicate && (
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="p-1.5 rounded-lg hover:bg-gray-200/70 transition"
                  aria-label="Duplicate"
                >
                  <Copy size={15} className="text-gray-500" />
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 transition"
                aria-label="Delete"
              >
                <Trash2 size={15} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionCard;