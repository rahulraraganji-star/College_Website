import { useState, useMemo, useRef } from "react";
import useMediaLibrary from "../hooks/useMediaLibrary";
import FolderCard from "../components/FolderCard";
import MediaCard from "../components/MediaCard";
import UploadDropzone from "../components/UploadDropzone";
import FolderBreadcrumb from "../components/FolderBreadcrumb";
import MediaToolbar from "../components/MediaToolbar";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";

const MediaLibrary = () => {
  /* -----------------------------
      STATES
  ----------------------------- */
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");
  const [path, setPath] = useState([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    media,
    folders,
    loading,
    error,
    loadLibrary,
    uploadMedia,
    deleteMedia,
    deleteMediaBulk,
    createFolder,
    deleteFolder,
    currentFolder,
    setSearch: setLibrarySearch,
    setCurrentFolder,
  } = useMediaLibrary();

  /* -----------------------------
      SEARCH
  ----------------------------- */
  const handleSearch = (value) => {
    setSearch(value);
    setLibrarySearch(value);
  };

  /* -----------------------------
      TOAST HELPER
  ----------------------------- */
  const showToast = (type, message) => {
    setToast({
      open: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);
  };

  /* -----------------------------
      UPLOAD
  ----------------------------- */
  const handleUpload = async (files) => {
    if (!files || !files.length) return;

    try {
      setUploading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) {
          formData.append("folder", currentFolder);
        }

        try {
          await uploadMedia(formData);
          successCount++;
        } catch (err) {
          console.error("MEDIA UPLOAD ERROR for", file.name, err);
          errorCount++;
        }
      }

      if (successCount > 0 && errorCount === 0) {
        showToast(
          "success",
          `${successCount} ${successCount === 1 ? "media item" : "media items"} uploaded successfully.`
        );
      } else if (successCount > 0 && errorCount > 0) {
        showToast("error", `${successCount} uploaded, ${errorCount} failed.`);
      } else if (errorCount > 0) {
        showToast("error", "Failed to upload media.");
      }
    } catch (error) {
      console.error("MEDIA UPLOAD ERROR:", error);
      showToast("error", error.message || "Failed to upload media.");
    } finally {
      setUploading(false);
    }
  };

  /* -----------------------------
      SELECTION HANDLERS
  ----------------------------- */
  const handleSelectMedia = (media) => {
    setSelectedMediaIds((prev) => {
      if (prev.includes(media._id)) {
        return prev.filter((id) => id !== media._id);
      }
      return [...prev, media._id];
    });
  };

  const clearSelection = () => {
    setSelectedMediaIds([]);
  };

  const selectAllVisibleMedia = () => {
    const visibleIds = media.map((item) => item._id);
    setSelectedMediaIds(visibleIds);
  };

  const handleBulkDelete = () => {
    if (selectedMediaIds.length === 0) return;
    setDeleteType("bulk-media");
    setShowDeleteModal(true);
  };

  /* -----------------------------
      DELETE HANDLERS
  ----------------------------- */
  const handleDeleteMedia = (media) => {
    setDeleteTarget(media);
    setDeleteType("media");
    setShowDeleteModal(true);
  };

  const confirmDeleteMedia = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteMedia(deleteTarget._id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteType(null);
      showToast("success", "Media deleted successfully.");
    } catch (error) {
      console.error("MEDIA DELETE ERROR:", error);
      showToast("error", error.message || "Failed to delete media.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedMediaIds.length === 0) return;

    try {
      setIsDeleting(true);

      const result = await deleteMediaBulk(selectedMediaIds);

      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteType(null);
      setSelectedMediaIds([]);

      showToast(
        "success",
        `${result.deletedCount} media ${
          result.deletedCount === 1 ? "item" : "items"
        } deleted successfully.`
      );
    } catch (error) {
      console.error("BULK MEDIA DELETE ERROR:", error);
      showToast("error", error.message || "Failed to delete media.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFolder = (folder) => {
    setDeleteTarget(folder);
    setDeleteType("folder");
    setShowDeleteModal(true);
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;

    try {
      await createFolder({ name: name.trim() });
      showToast("success", "Folder created successfully.");
    } catch (err) {
      console.error("CREATE FOLDER ERROR:", err);
      showToast("error", err.message || "Failed to create folder.");
    }
  };

  const confirmDeleteFolder = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteFolder(deleteTarget._id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteType(null);
      showToast("success", "Folder deleted successfully.");
    } catch (error) {
      console.error("FOLDER DELETE ERROR:", error);
      showToast("error", error.message || "Failed to delete folder.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPdfItem = (item) => {
    return Boolean(
      item?.type === "pdf" ||
      item?.mimeType === "application/pdf" ||
      item?.extension === "pdf" ||
      (item?.url && item.url.toLowerCase().split("?")[0].endsWith(".pdf")) ||
      (item?.filename && item.filename.toLowerCase().endsWith(".pdf")) ||
      (item?.originalName && item.originalName.toLowerCase().endsWith(".pdf"))
    );
  };

  const isDocumentItem = (item) => {
    return Boolean(
      item?.type === "document" ||
      isPdfItem(item) ||
      item?.mimeType?.includes("word") ||
      item?.mimeType?.includes("excel") ||
      item?.mimeType?.includes("powerpoint") ||
      item?.mimeType?.startsWith("text/") ||
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv)$/i.test(
        item?.url || item?.filename || item?.originalName || ""
      )
    );
  };

  const isImageItem = (item) => {
    return Boolean(
      item?.type === "image" ||
      item?.mimeType?.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(
        item?.url || item?.filename || item?.originalName || ""
      )
    );
  };

  const isVideoItem = (item) => {
    return Boolean(
      item?.type === "video" ||
      item?.mimeType?.startsWith("video/") ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(
        item?.url || item?.filename || item?.originalName || ""
      )
    );
  };

  const isAudioItem = (item) => {
    return Boolean(
      item?.type === "audio" ||
      item?.mimeType?.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|flac)$/i.test(
        item?.url || item?.filename || item?.originalName || ""
      )
    );
  };

  const filteredMedia = useMemo(() => {
    let items = [...media];

    if (filter && filter !== "all") {
      items = items.filter((item) => {
        if (filter === "pdf") {
          return isPdfItem(item);
        }
        if (filter === "document") {
          return isDocumentItem(item);
        }
        if (filter === "image") {
          return isImageItem(item);
        }
        if (filter === "video") {
          return isVideoItem(item);
        }
        if (filter === "audio") {
          return isAudioItem(item);
        }
        return item.type === filter;
      });
    }

    return items;
  }, [media, filter]);

  return (
    <div className="space-y-6">
      {/* Hidden file input for toolbar upload button */}
      <input
        ref={uploadInputRef}
        type="file"
        hidden
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleUpload(files);
          e.target.value = "";
        }}
      />

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1">
            Media
          </p>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight">Media Library</h1>
          <p className="text-[14px] text-neutral-500 mt-1.5">
            Manage images, documents and videos.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Refresh media library"
            onClick={loadLibrary}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="border border-red-300 bg-red-50 text-red-600 rounded-xl px-5 py-4">
          {error}
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
        onUpload={() => uploadInputRef.current?.click()}
        onNewFolder={handleCreateFolder}
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

          const index = path.findIndex(
            (f) => (f._id || f.id) === (folder._id || folder.id)
          );

          setPath(path.slice(0, index + 1));
          setCurrentFolder(folder._id || folder.id);
        }}
      />

      {/* UPLOAD */}
      <div className="space-y-3">
        <UploadDropzone onFilesSelected={handleUpload} />
        {uploading && <div className="text-sm text-blue-600">Uploading...</div>}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
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
              <h2 className="text-xl font-semibold mb-5">Folders</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-6">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder._id || folder.id}
                    folder={folder}
                    onOpen={(selectedFolder) => {
                      setPath((prev) => [...prev, selectedFolder]);
                      setCurrentFolder(selectedFolder._id || selectedFolder.id);
                    }}
                    onDelete={() => handleDeleteFolder(folder)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* -----------------------------
              BULK SELECTION TOOLBAR
          ----------------------------- */}
          {selectedMediaIds.length > 0 && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">

  <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-gray-900 px-2 text-sm font-semibold text-white">
    {selectedMediaIds.length}
  </div>

  <span className="text-sm font-medium text-gray-700">
  {selectedMediaIds.length === 1
    ? "item selected"
    : "items selected"}
</span>

</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllVisibleMedia}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* -----------------------------
              MEDIA
          ----------------------------- */}
          <section>
            <h2 className="text-xl font-semibold mb-5">Media</h2>
            <div
              className={
                view === "grid"
                  ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-6`
                  : `flex flex-col gap-4`
              }
            >
              {[...filteredMedia]
                .sort((a, b) => {
                  switch (sort) {
                    case "name":
                      return (
                        a.originalName || a.filename
                      ).localeCompare(b.originalName || b.filename);
                    case "oldest":
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    case "latest":
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    default:
                      return 0;
                  }
                })
                .map((item) => (
                  <MediaCard
                    key={item._id}
                    media={item}
                    selected={selectedMediaIds.includes(item._id)}
                    onSelect={handleSelectMedia}
                    onDelete={() => handleDeleteMedia(item)}
                  />
                ))}
            </div>
          </section>

          {/* -----------------------------
              EMPTY STATE
          ----------------------------- */}
          {media.length === 0 && (
            <div className="border-2 border-dashed rounded-2xl p-20 text-center">
              <div className="text-7xl">🖼️</div>
              <h3 className="text-2xl font-semibold mt-6">
                No media has been uploaded yet.
              </h3>
              <p className="text-gray-500 mt-3">
                Drag & drop files above or click to upload.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={showDeleteModal}
        loading={isDeleting}
        title={
          deleteType === "folder"
            ? "Delete Folder"
            : deleteType === "bulk-media"
              ? "Delete Media Items"
              : "Delete Media"
        }
        message={
          deleteType === "bulk-media"
            ? `Are you sure you want to delete ${selectedMediaIds.length} media ${
                selectedMediaIds.length === 1 ? "item" : "items"
              }? This action cannot be undone.`
            : `Are you sure you want to delete "${
                deleteTarget?.originalName ||
                deleteTarget?.filename ||
                deleteTarget?.name ||
                ""
              }"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setDeleteTarget(null);
          setDeleteType(null);
        }}
        onConfirm={
          deleteType === "media"
            ? confirmDeleteMedia
            : deleteType === "bulk-media"
              ? confirmBulkDelete
              : confirmDeleteFolder
        }
      />

      {/* TOAST */}
      <Toast open={toast.open} type={toast.type} message={toast.message} />
    </div>
  );
};

export default MediaLibrary;