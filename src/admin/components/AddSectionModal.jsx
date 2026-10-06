import {
  X,
  LayoutTemplate,
  Heading,
  FileText,
  ListCheck,
  Users,
  Images,
  FileDown,
  Table,
  Clock,
  CalendarDays,
  Network,
  Link2,
  Megaphone,
} from "lucide-react";
import { sectionTypes } from "../config/sectionTypes";

const ICON_MAP = {
  hero: LayoutTemplate,
  heading: Heading,
  richText: FileText,
  list: ListCheck,
  "faculty-grid": Users,
  gallery: Images,
  documentList: FileDown,
  table: Table,
  timeline: Clock,
  eventList: CalendarDays,
  organogram: Network,
  embed: Link2,
  notices: Megaphone,
};

const AddSectionModal = ({ onSelect, onClose }) => {
  const groupedSections = Object.entries(sectionTypes).reduce(
    (acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }

      acc[value.category].push({
        key,
        ...value,
      });

      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Add Section
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choose an editor component to add to this page
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
            title="Close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories & Section Type Cards */}
        <div className="space-y-7">
          {Object.entries(groupedSections).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3 flex items-center gap-2">
                <span>{category}</span>
                <span className="flex-1 h-px bg-neutral-100" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {items.map((item) => {
                  const Icon = ICON_MAP[item.key] || LayoutTemplate;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onSelect(item.key)}
                      className="group flex items-start gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white hover:border-black hover:shadow-xs text-left transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-black group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Icon size={19} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-neutral-900 tracking-tight group-hover:text-black">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1 leading-normal">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;