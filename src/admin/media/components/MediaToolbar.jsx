import {
  Search,
  Upload,
  FolderPlus,
  Grid2X2,
  List,
} from "lucide-react";

const MediaToolbar = ({
  search,
  onSearch,
  filter,
  onFilter,
  sort,
  onSort,
  view = "grid",
  onViewChange,
  onUpload,
  onNewFolder,
}) => {

  return (

    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-xl
        p-4
        flex
        flex-wrap
        items-center
        gap-4
        justify-between
      "
    >

      {/* Search */}

      <div className="relative flex-1 min-w-[260px]">

        <Search
          size={18}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) =>
            onSearch?.(e.target.value)
          }
          className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-2.5
            outline-none
            focus:ring-2
            focus:ring-black
          "
        />

      </div>

      {/* Filter */}

      <select
        value={filter}
        onChange={(e) =>
          onFilter?.(e.target.value)
        }
        className="
          border
          rounded-lg
          px-4
          py-2.5
        "
      >

        <option value="all">
          All Files
        </option>

        <option value="image">
          Images
        </option>

        <option value="document">
          Documents
        </option>

        <option value="pdf">
          PDFs
        </option>

        <option value="video">
          Videos
        </option>

        <option value="audio">
          Audio
        </option>

      </select>

      {/* Sort */}

      <select
        value={sort}
        onChange={(e) =>
          onSort?.(e.target.value)
        }
        className="
          border
          rounded-lg
          px-4
          py-2.5
        "
      >

        <option value="latest">
          Latest
        </option>

        <option value="oldest">
          Oldest
        </option>

        <option value="name">
          Name
        </option>

        <option value="size">
          Size
        </option>

      </select>

      {/* View Toggle */}

      <div className="flex border rounded-lg overflow-hidden">

        <button
          type="button"
          onClick={() =>
            onViewChange?.("grid")
          }
          className={`
            px-3
            py-2
            ${
              view === "grid"
                ? "bg-black text-white"
                : "bg-white"
            }
          `}
        >

          <Grid2X2 size={18} />

        </button>

        <button
          type="button"
          onClick={() =>
            onViewChange?.("list")
          }
          className={`
            px-3
            py-2
            ${
              view === "list"
                ? "bg-black text-white"
                : "bg-white"
            }
          `}
        >

          <List size={18} />

        </button>

      </div>

      {/* New Folder */}

      <button
        type="button"
        onClick={onNewFolder}
        className="
          border
          rounded-lg
          px-4
          py-2.5
          flex
          items-center
          gap-2
          hover:bg-gray-100
        "
      >

        <FolderPlus size={18} />

        New Folder

      </button>

      {/* Upload */}

      <button
        type="button"
        onClick={onUpload}
        className="
          bg-black
          text-white
          rounded-lg
          px-4
          py-2.5
          flex
          items-center
          gap-2
          hover:bg-gray-800
        "
      >

        <Upload size={18} />

        Upload

      </button>

    </div>

  );

};

export default MediaToolbar;