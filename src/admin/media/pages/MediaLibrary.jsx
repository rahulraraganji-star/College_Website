import { useState } from "react";

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

  /* -----------------------------
      TEMP DATA
      (Replace with API later)
  ----------------------------- */

  const folders = [

    {
      id: "1",
      name: "Images",
      itemCount: 120,
      updatedAt: "Today",
    },

    {
      id: "2",
      name: "Documents",
      itemCount: 42,
      updatedAt: "Yesterday",
    },

    {
      id: "3",
      name: "Events",
      itemCount: 88,
      updatedAt: "2 days ago",
    },

  ];

  const media = [

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
      size: "4.5 MB",
    },

    {
      id: "3",
      filename: "principal.jpg",
      type: "image",
      url: "https://placehold.co/600x600",
      width: 800,
      height: 800,
      size: "650 KB",
    },

  ];

  /* -----------------------------
      UPLOAD
  ----------------------------- */

  const handleUpload = (files) => {

    console.log(files);

    // TODO
    // mediaService.upload(files)

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

      </div>

      {/* TOOLBAR */}

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

      {/* BREADCRUMB */}

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

      {/* UPLOAD */}

      <UploadDropzone
        onFilesSelected={handleUpload}
      />

      {/* CONTENT */}

      <div className="space-y-10">

        {/* CONTENT */}

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
            key={folder.id}
            folder={folder}
            onOpen={(selectedFolder) =>
              setPath([
                ...path,
                selectedFolder,
              ])
            }
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

      {media

        .filter((item) => {

          const matchesSearch =
            item.filename
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "all"
              ? true
              : item.type === filter;

          return (
            matchesSearch &&
            matchesFilter
          );

        })

        .sort((a, b) => {

          switch (sort) {

            case "name":

              return a.filename.localeCompare(
                b.filename
              );

            case "size":

              return (
                (a.size || "")
                  .localeCompare(
                    b.size || ""
                  )
              );

            case "oldest":

              return -1;

            default:

              return 1;

          }

        })

        .map((item) => (

          <MediaCard
            key={item.id}
            media={item}
            selected={
              selectedMedia?.id ===
              item.id
            }
            onSelect={
              setSelectedMedia
            }
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

      <div className="text-6xl">

        📁

      </div>

      <h3 className="text-2xl font-semibold mt-6">

        No media found

      </h3>

      <p className="text-gray-500 mt-3">

        Upload images, documents or videos
        to populate your media library.

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

          {selectedMedia.filename}

        </p>

      </div>

      <button
        type="button"
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

      </div>

    </div>

  );

};

export default MediaLibrary;