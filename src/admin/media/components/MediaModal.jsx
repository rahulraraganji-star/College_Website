import { X } from "lucide-react";
import { useState } from "react";

import MediaToolbar from "./MediaToolbar";
import FolderBreadcrumb from "./FolderBreadcrumb";
import UploadDropzone from "./UploadDropzone";
import FolderCard from "./FolderCard";
import MediaCard from "./MediaCard";

const dummyFolders = [
  {
    id: "1",
    name: "Images",
    itemCount: 125,
    updatedAt: "Today",
  },
  {
    id: "2",
    name: "Documents",
    itemCount: 36,
    updatedAt: "Yesterday",
  },
];

const dummyMedia = [
  {
    id: "1",
    filename: "college.jpg",
    type: "image",
    url: "https://placehold.co/600x400",
    width: 1920,
    height: 1080,
    size: "2.3 MB",
  },
  {
    id: "2",
    filename: "Prospectus.pdf",
    type: "pdf",
    size: "4.8 MB",
  },
];

const MediaModal = ({
  onClose,
  onSelect,
}) => {

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [sort, setSort] =
    useState("latest");

  const [view, setView] =
    useState("grid");

  const [path, setPath] =
    useState([]);

  const [selectedMedia, setSelectedMedia] =
    useState(null);

  const handleUpload = (files) => {

    // TODO: replace with real upload once mediaService is wired up
    // await mediaService.upload(files);
    console.log(files);

  };

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-7xl
          h-[90vh]
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
      >

        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
          "
        >

          <h2 className="text-2xl font-semibold">

            Media Library

          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              p-2
              rounded-lg
              hover:bg-gray-100
            "
          >

            <X size={22} />

          </button>

        </div>

        {/* Toolbar */}

        <div className="p-6 pb-0">

          <MediaToolbar
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            sort={sort}
            onSort={setSort}
            view={view}
            onViewChange={setView}
            onUpload={() => {}}
            onNewFolder={() => {}}
          />

        </div>

        {/* Breadcrumb */}

        <div className="px-6 pt-5">

          <FolderBreadcrumb
            folders={path}
            onNavigate={(folder) => {

              if (!folder) {

                setPath([]);

                return;

              }

              const index =
                path.findIndex(
                  (f) =>
                    f.id === folder.id
                );

              setPath(
                path.slice(
                  0,
                  index + 1
                )
              );

            }}
          />

        </div>

        {/* Upload */}

        <div className="px-6 py-5">

          <UploadDropzone
            onFilesSelected={
              handleUpload
            }
          />

        </div>

        {/* CONTENT STARTS HERE */}

        <div
          className="
            flex-1
            overflow-auto
            px-6
            pb-6
          "
        >

                    {/* Empty State */}

          <div className="space-y-8">

            {/* Folder Grid */}

            {path.length === 0 && (

              <div>

                <h3 className="text-lg font-semibold mb-4">

                  Folders

                </h3>

                <div
                  className="
                    grid
                    grid-cols-2
                    md:grid-cols-4
                    xl:grid-cols-6
                    gap-5
                  "
                >

                  {/* Dummy folders for now */}

                  {dummyFolders.map((folder) => (

                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onOpen={(selected) =>
                        setPath([
                          ...path,
                          selected,
                        ])
                      }
                    />

                  ))}

                </div>

              </div>

            )}

            {/* Media */}

            <div>

              <h3 className="text-lg font-semibold mb-4">

                Files

              </h3>

              <div
                className={`
                  grid
                  gap-5
                  ${
                    view === "grid"
                      ? "grid-cols-2 md:grid-cols-4 xl:grid-cols-6"
                      : "grid-cols-1"
                  }
                `}
              >

                {dummyMedia.map((media) => (

                  <MediaCard
                    key={media.id}
                    media={media}
                    selected={
                      selectedMedia?.id === media.id
                    }
                    onSelect={(item) => {

                      setSelectedMedia(item);

                    }}
                  />

                ))}

              </div>

            </div>

            {/* Empty */}

            {false && (

              <div className="py-24 text-center">

                <h3 className="text-xl font-semibold">

                  No media found

                </h3>

                <p className="text-gray-500 mt-2">

                  Upload files to get started.

                </p>

              </div>

            )}

          </div>

        </div>

        {/* Footer */}

        <div
          className="
            border-t
            px-6
            py-4
            flex
            justify-between
            items-center
            bg-gray-50
          "
        >

          <div className="text-sm text-gray-500">

            Select an image or document from the library.

          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              className="
                px-5
                py-2.5
                rounded-lg
                border
                hover:bg-gray-100
              "
            >

              Cancel

            </button>

            <button
              type="button"
              disabled={!selectedMedia}
              onClick={() => {

                if (selectedMedia) {

                  onSelect(selectedMedia);

                  onClose();

                }

              }}
              className={`
                bg-black
                text-white
                px-5
                py-2.5
                rounded-lg
                transition

                ${
                  selectedMedia
                    ? "hover:bg-gray-800"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            >

              Select

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

    

export default MediaModal;