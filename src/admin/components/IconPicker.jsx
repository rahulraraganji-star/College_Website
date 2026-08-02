import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";
import { navigationIcons } from "../constants/navigationIcons";

const IconPicker = ({
  value,
  onChange,
}) => {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    return navigationIcons.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-3">
      {/* Search */}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Icons */}

      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-3">

        {filteredIcons.map((name) => {

          const Icon =
            Icons[name] || Icons.Circle;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={`h-12 rounded-lg border transition flex items-center justify-center

              ${
                value === name
                  ? "border-black bg-black text-white"
                  : "border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Selected */}

      {value && (
        <div className="text-xs text-gray-500">
          Selected: <span className="font-medium">{value}</span>
        </div>
      )}
    </div>
  );
};

export default IconPicker;