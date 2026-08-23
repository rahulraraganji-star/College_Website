import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import useMediaLibrary from "../hooks/useMediaLibrary";

import MediaCard from "../components/MediaCard";
import FolderCard from "../components/FolderCard";
import FolderBreadcrumb from "../components/FolderBreadcrumb";
import UploadDropzone from "../components/UploadDropzone";
import MediaToolbar from "../components/MediaToolbar";

const MediaModal = ({
  isOpen,
  onClose,
  onSelect,

  type = "all",

  multiple = false,

  title = "Select Media",
}) => {
  /* ==========================================================
      MEDIA HOOK
  ========================================================== */

  const {
    media,
    folders,

    loading,
    error,

    uploadMedia,
    createFolder,

    setCurrentFolder,

    setSearch: setLibrarySearch,
  } = useMediaLibrary();

  /* ==========================================================
      LOCAL STATE
  ========================================================== */

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState(type);

  const [sort, setSort] = useState("latest");

  const [view, setView] = useState("grid");

  const [path, setPath] = useState([]);

  const [uploading, setUploading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedItems, setSelectedItems] =
    useState([]);

  const uploadInputRef = useRef(null);

  /* ==========================================================
      SYNC TYPE PROP
  ========================================================== */

  useEffect(() => {
    setFilter(type);
  }, [type]);

  /* ==========================================================
      SEARCH
  ========================================================== */

  const handleSearch = (value) => {
    setSearch(value);
    setLibrarySearch(value);
  };

  /* ==========================================================
      CLOSE MODAL
  ========================================================== */

  const handleClose = useCallback(() => {
    setSelectedItems([]);
    setSearch("");
    setLibrarySearch("");
    setPath([]);

    onClose?.();
  }, [onClose, setLibrarySearch]);

  /* ==========================================================
      ESC KEY
  ========================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, handleClose]);

  /* ==========================================================
      BACKDROP CLICK
  ========================================================== */

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  /* ==========================================================
      UPLOAD
      Uploads every selected file, one at a time, against the
      existing single-file endpoint (formData key "file"). This
      avoids depending on backend support for a multi-file payload.
  ========================================================== */
const handleUpload = async (files) => {

   console.log(" NEW HANDLEUPLOAD", files);

    if (!files.length) return;

    setUploading(true);

    for (const file of files) {

        console.log("2. Uploading", file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {

            console.log("3. Calling uploadMedia");
            console.log("1");
            await uploadMedia(formData);
            console.log("2");

            console.log("4. Upload success");

        } catch (err) {

            console.error("UPLOAD ERROR", err);

        }

    }

    console.log("5. Finished");

    setUploading(false);

};

  /* ==========================================================
      CREATE FOLDER
  ========================================================== */

  const handleCreateFolder = async () => {
    const name = window.prompt(
      "Enter folder name"
    );

    if (!name) return;

    await createFolder({
      name,
    });
  };

  /* ==========================================================
      FILTERED MEDIA
  ========================================================== */

  const filteredMedia = useMemo(() => {
    let items = [...media];

    if (filter !== "all") {
      items = items.filter(
        (item) => item.type === filter
      );
    }

    switch (sort) {
      case "name":
        items.sort((a, b) =>
          (
            a.originalName ||
            a.filename
          ).localeCompare(
            b.originalName ||
              b.filename
          )
        );
        break;

      case "oldest":
        items.sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
        break;

      default:
        items.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }

    return items;
  }, [media, filter, sort]);

  /* ==========================================================
      SELECTION
  ========================================================== */

  const toggleSelection = (item) => {
    if (!multiple) {
      setSelectedItems([item]);
      return;
    }

    setSelectedItems((prev) => {
      const exists = prev.some(
        (selected) =>
          selected._id === item._id
      );

      if (exists) {
        return prev.filter(
          (selected) =>
            selected._id !== item._id
        );
      }

      return [...prev, item];
    });
  };

  /* ==========================================================
      DO NOT RENDER
  ========================================================== */
 

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden file input for toolbar upload button */}
      <input
        ref={uploadInputRef}
        type="file"
        hidden
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleUpload(files);
          // Allow selecting the same file again
          e.target.value = "";
        }}
      />

      <div
        className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-6"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* ======================================================
              HEADER
          ====================================================== */}

          <div className="border-b px-6 py-5 flex justify-between items-center">

            <div>
              <h2 className="text-2xl font-bold">
                {title}
              </h2>

              <p className="text-gray-500 mt-1">
                Browse and select media.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close Media Modal"
              className="w-10 h-10 rounded-lg hover:bg-gray-100 text-xl"
            >
              ✕
            </button>
          </div>

          {/* ======================================================
              TOOLBAR
          ====================================================== */}

          <div className="border-b p-5 space-y-4">

            <MediaToolbar
              search={search}
              onSearch={handleSearch}
              filter={filter}
              onFilter={setFilter}
              sort={sort}
              onSort={setSort}
              view={view}
              onViewChange={setView}
              onUpload={() => uploadInputRef.current?.click()}
              onNewFolder={handleCreateFolder}
            />

            <UploadDropzone
              multiple={true}
              onFilesSelected={(files) => {
                  console.log("Dropzone fired");
                  handleUpload(files);
              }}
            />

            {uploading && (
              <div className="text-blue-600 text-sm">
                Uploading...
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}
          </div>

                 {/* ======================================================
              CONTENT
          ====================================================== */}

          <div className="flex-1 overflow-hidden flex flex-col">

            {/* ======================================================
                BREADCRUMB
            ====================================================== */}

            <div className="border-b px-6 py-4">

              <FolderBreadcrumb
                folders={path}
                onNavigate={(folder) => {

                  if (!folder) {

                    setPath([]);

                    setCurrentFolder(null);

                    return;
                  }

                  const index = path.findIndex(
                    (f) =>
                      (f._id || f.id) ===
                      (folder._id || folder.id)
                  );

                  setPath((prev) =>
                    prev.slice(0, index + 1)
                  );

                  setCurrentFolder(
                    folder._id || folder.id
                  );
                }}
              />

            </div>

            {/* ======================================================
                SCROLLABLE CONTENT
            ====================================================== */}

            <div className="flex-1 overflow-y-auto p-6 space-y-10">

              {/* ==================================================
                  FOLDERS
              ================================================== */}

              {path.length === 0 &&
                folders.length > 0 && (

                <section>

                  <div className="flex items-center justify-between mb-5">

                    <h3 className="text-xl font-semibold">

                      Folders

                    </h3>

                    <span className="text-sm text-gray-500">

                      {folders.length} Folder
                      {folders.length !== 1 ? "s" : ""}

                    </span>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      md:grid-cols-4
                      xl:grid-cols-6
                      gap-5
                    "
                  >

                    {folders.map((folder) => (

                      <FolderCard
                        key={folder._id || folder.id}

                        folder={folder}

                        onOpen={(selectedFolder) => {

                          setPath((prev) => [
                            ...prev,
                            selectedFolder,
                          ]);

                          setCurrentFolder(
                            selectedFolder._id ||
                            selectedFolder.id
                          );

                        }}
                      />

                    ))}

                  </div>

                </section>

              )}

              {/* ==================================================
                  CURRENT FOLDER INFO
              ================================================== */}

              {path.length > 0 && (

                <div
                  className="
                    rounded-xl
                    border
                    bg-gray-50
                    px-5
                    py-4
                    flex
                    justify-between
                    items-center
                  "
                >

                  <div>

                    <h3 className="font-semibold">

                      {
                        path[path.length - 1]
                          ?.name
                      }

                    </h3>

                    <p className="text-sm text-gray-500">

                      Viewing folder contents

                    </p>

                  </div>

                  <button
                    type="button"

                    className="
                      border
                      rounded-lg
                      px-4
                      py-2
                      hover:bg-white
                    "

                    onClick={() => {

                      setPath([]);

                      setCurrentFolder(null);

                    }}
                  >

                    Back to Root

                  </button>

                </div>

              )}

              {/* ==================================================
                  MEDIA SECTION STARTS HERE
                  (Part 3 continues)
              ================================================== */}

                          <section>

                <div className="flex items-center justify-between mb-5">

                  <h3 className="text-xl font-semibold">
                    Media
                  </h3>

                  <span className="text-sm text-gray-500">
                    {filteredMedia.length} Item
                    {filteredMedia.length !== 1 ? "s" : ""}
                  </span>

                </div>

                {/* ==========================================
                    LOADING SKELETON
                ========================================== */}

                {loading ? (

                  <div
                    className="
                      grid
                      grid-cols-2
                      md:grid-cols-4
                      xl:grid-cols-6
                      gap-5
                    "
                  >

                    {Array.from({
                      length: 12,
                    }).map((_, index) => (

                      <div
                        key={index}
                        className="
                          aspect-square
                          rounded-xl
                          bg-gray-200
                          animate-pulse
                        "
                      />

                    ))}

                  </div>

                ) : filteredMedia.length === 0 ? (

                  /* ======================================
                      EMPTY STATE
                  ====================================== */

                  <div
                    className="
                      border-2
                      border-dashed
                      rounded-2xl
                      p-20
                      text-center
                    "
                  >

                    <div className="text-7xl">

                      🖼️

                    </div>

                    <h3 className="text-2xl font-semibold mt-6">

                      No media found

                    </h3>

                    <p className="text-gray-500 mt-3">

                      Upload files or change the filter.

                    </p>

                  </div>

                ) : (

                  /* ======================================
                      MEDIA GRID / LIST
                  ====================================== */

                  <div
                    className={
                      view === "grid"

                        ? `
                            grid
                            grid-cols-2
                            md:grid-cols-4
                            xl:grid-cols-6
                            gap-5
                          `

                        : `
                            flex
                            flex-col
                            gap-4
                          `
                    }
                  >

                    {filteredMedia.map((item) => {

                      const selected =
                        selectedItems.some(
                          (media) =>
                            media._id === item._id
                        );

                      return (

                        <div
                          key={item._id}
                          className="relative"
                        >

                          {/* Selection Badge */}

                          {selected && (

                            <div
                              className="
                                absolute
                                top-2
                                right-2
                                z-20
                                h-7
                                w-7
                                rounded-full
                                bg-blue-600
                                text-white
                                flex
                                items-center
                                justify-center
                                text-sm
                                font-bold
                                shadow-lg
                              "
                            >

                              ✓

                            </div>

                          )}

                          <MediaCard
                            media={item}

                            selected={selected}

                            onSelect={() =>
                              toggleSelection(item)
                            }
                          />

                        </div>

                      );

                    })}

                  </div>

                )}

              </section>

              {/* ==========================================
                  SELECTED ITEMS SUMMARY
              ========================================== */}

              {selectedItems.length > 0 && (

                <div
                  className="
                    rounded-xl
                    border
                    bg-blue-50
                    border-blue-200
                    px-5
                    py-4
                    flex
                    justify-between
                    items-center
                  "
                >

                  <div>

                    <h4 className="font-semibold">

                      {multiple
                        ? `${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""} selected`
                        : "1 item selected"}

                    </h4>

                    <p className="text-sm text-gray-600 mt-1">

                      {selectedItems
                        .slice(0, 3)
                        .map(
                          (item) =>
                            item.originalName ||
                            item.filename
                        )
                        .join(", ")}

                      {selectedItems.length > 3 &&
                        ` +${selectedItems.length - 3} more`}

                    </p>

                  </div>

                  <button
                    type="button"
                    className="
                      border
                      rounded-lg
                      px-4
                      py-2
                      hover:bg-white
                    "
                    onClick={() =>
                      setSelectedItems([])
                    }
                  >

                    Clear

                  </button>

                </div>

              )}

            </div>

          </div>

                {/* ======================================================
              FOOTER
          ====================================================== */}

          <div
            className="
              border-t
              px-6
              py-4
              flex
              items-center
              justify-between
              bg-white
            "
          >

            <div className="text-sm text-gray-500">

              {selectedItems.length === 0
                ? "No media selected"
                : multiple
                ? `${selectedItems.length} item${
                    selectedItems.length > 1 ? "s" : ""
                  } selected`
                : selectedItems[0]?.originalName ||
                  selectedItems[0]?.filename}

            </div>

            <div className="flex items-center gap-3">

              {/* Cancel */}

              <button
                type="button"
                onClick={handleClose}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  border
                  hover:bg-gray-100
                  transition-colors
                "
              >
                Cancel
              </button>

              {/* Select */}

              <button
                type="button"
                disabled={selectedItems.length === 0 || uploading}
                onClick={() => {

                  if (multiple) {

                    onSelect?.(selectedItems);

                  } else {

                    onSelect?.(selectedItems[0]);

                  }

                  handleClose();

                }}
                className={`
                  px-6
                  py-2.5
                  rounded-lg
                  text-white
                  transition-colors

                  ${
                    selectedItems.length === 0 || uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >

                Select

              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );

};

export default MediaModal;