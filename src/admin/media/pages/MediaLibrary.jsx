import { useState } from "react";

import useMediaLibrary from "../hooks/useMediaLibrary";

import FolderCard from "../components/FolderCard";
import MediaCard from "../components/MediaCard";
import UploadDropzone from "../components/UploadDropzone";
import FolderBreadcrumb from "../components/FolderBreadcrumb";
import MediaToolbar from "../components/MediaToolbar";

const MediaLibrary = () => {

  /* -----------------------------
      STATES
  ----------------------------- */

  const [search, setSearch] =
    useState("");

  const handleSearch = (value) => {

    setSearch(value);

    setLibrarySearch(value);

  };

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

  const [successMessage, setSuccessMessage] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const {

    media,

    folders,

    loading,

    error,

    loadLibrary,

    uploadMedia,

    deleteMedia,

    createFolder,

    setSearch: setLibrarySearch,

    setCurrentFolder,

  } = useMediaLibrary();

  /* -----------------------------
      UPLOAD
  ----------------------------- */

  const handleUpload = async (
    files
  ) => {

    if (!files.length) return;

    try {

      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        files[0]
      );

      await uploadMedia(formData);

      setSuccessMessage(
        "Media uploaded successfully."
      );

      setTimeout(() => {

        setSuccessMessage("");

      }, 3000);

    } catch (error) {

      console.error(error);

      alert(error.message);

    } finally {

      setUploading(false);

    }

  };

  return (

    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">

            Media Library

          </h1>

          <p className="text-gray-500 mt-1">

            Manage images, documents and videos.

          </p>

        </div>

        <div className="flex gap-3">

          <button
            type="button"
            aria-label="Refresh media library"
            onClick={loadLibrary}
            className="
              border
              px-4
              py-2
              rounded-lg
              hover:bg-gray-100
            "
          >

            Refresh

          </button>

        </div>

      </div>

      {/* ERROR BANNER */}

      {error && (

        <div
          className="
            border
            border-red-300
            bg-red-50
            text-red-600
            rounded-xl
            px-5
            py-4
          "
        >

          {error}

        </div>

      )}

      {/* SUCCESS BANNER */}

      {successMessage && (

        <div
          className="
            rounded-xl
            border
            border-green-300
            bg-green-50
            text-green-700
            px-5
            py-3
          "
        >

          {successMessage}

        </div>

      )}

      {/* TOOLBAR */}

      <MediaToolbar
        search={search}
        onSearch={handleSearch}
        filter={filter}
        onFilter={setFilter}
        sort={sort}
        onSort={setSort}
        view={view}
        onViewChange={setView}
        onUpload={() => {}}
        onNewFolder={async () => {

          const name = window.prompt(
            "Folder name"
          );

          if (!name) return;

          await createFolder({

            name,

          });

        }}
      />

      {/* BREADCRUMB */}

      <FolderBreadcrumb
        folders={path}
        onNavigate={(folder) => {

          if (!folder) {

            setPath([]);

            setCurrentFolder(null);

            return;

          }

          const index =
            path.findIndex(
              (f) =>
                (f._id || f.id) ===
                (folder._id || folder.id)
            );

          setPath(
            path.slice(
              0,
              index + 1
            )
          );

          setCurrentFolder(
            folder._id || folder.id
          );

        }}
      />

      {/* UPLOAD */}

      <div className="space-y-3">

        <UploadDropzone
          onFilesSelected={handleUpload}
        />

        {uploading && (

          <div
            className="
              text-sm
              text-blue-600
            "
          >

            Uploading...

          </div>

        )}

      </div>

      {/* CONTENT */}

      {loading ? (

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-5">

          {Array.from({

            length: 12,

          }).map((_, index) => (

            <div
              key={index}
              className="aspect-square rounded-xl bg-gray-200 animate-pulse"
            />

          ))}

        </div>

      ) : (

        <div className="space-y-10">

          {/* -----------------------------
              FOLDERS
          ----------------------------- */}

          {path.length === 0 && folders.length > 0 && (

            <section>

              <h2 className="text-xl font-semibold mb-5">

                Folders

              </h2>

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

          {/* -----------------------------
              MEDIA
          ----------------------------- */}

          <section>

            <h2 className="text-xl font-semibold mb-5">

              Media

            </h2>

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

              {[...media]

                .sort((a, b) => {

                  switch (sort) {

                    case "name":

                      return (
                        a.originalName ||
                        a.filename
                      ).localeCompare(
                        b.originalName ||
                        b.filename
                      );

                    case "oldest":

                      return (
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                      );

                    case "latest":

                      return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                      );

                    default:

                      return 0;

                  }

                })

                .map((item) => (

                  <MediaCard
                    key={item._id}
                    media={item}
                    selected={
                      selectedMedia?._id ===
                      item._id
                    }
                    onSelect={
                      setSelectedMedia
                    }
                    onDelete={async () => {

                      if (
                        !window.confirm(
                          "Delete this file?"
                        )
                      ) {

                        return;

                      }

                      await deleteMedia(
                        item._id
                      );

                    }}
                  />

                ))}

            </div>

          </section>

          {/* -----------------------------
              EMPTY STATE
          ----------------------------- */}

          {media.length === 0 && (

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

                No media has been uploaded yet.

              </h3>

              <p className="text-gray-500 mt-3">

                Drag & drop files above or click to upload.

              </p>

            </div>

          )}

          {/* -----------------------------
              SELECTED MEDIA
          ----------------------------- */}

          {selectedMedia && (

            <div
              className="
                bg-gray-50
                border
                rounded-xl
                p-5
                flex
                justify-between
                items-center
              "
            >

              <div>

                <h3 className="font-semibold">

                  Selected

                </h3>

                <p className="text-gray-500">

                  {
                    selectedMedia.originalName ||
                    selectedMedia.filename
                  }

                </p>

              </div>

              <button
                type="button"
                aria-label="Clear selected media"
                onClick={() =>
                  setSelectedMedia(null)
                }
                className="
                  border
                  px-4
                  py-2
                  rounded-lg
                  hover:bg-gray-100
                "
              >

                Clear Selection

              </button>

            </div>

          )}

        </div>

      )}

    </div>

  );

};

export default MediaLibrary;