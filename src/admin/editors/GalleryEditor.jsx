import { useState, useEffect } from "react";
import {
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  GripVertical,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react";
import MediaPicker from "../media/components/MediaPicker";
import { getCleanImageUrl } from "../../utils/imageUrl";

/**
 * Helper to safely extract and clean image URL from diverse DB structures
 */
const resolveImageUrl = (image) => {
  if (!image) return "";
  const raw =
    image.media?.url ||
    (typeof image.media === "string" ? image.media : "") ||
    image.url ||
    image.imageUrl ||
    image.src ||
    "";
  return getCleanImageUrl(raw);
};

const GalleryEditor = ({ section, onChange }) => {
  // Principal's Message Modal State
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
  const [editingPrincipalIndex, setEditingPrincipalIndex] = useState(null);
  const [formError, setFormError] = useState("");
  const [principalFormData, setPrincipalFormData] = useState({
    title: "Principal’s Message",
    name: "",
    designation: "Principal",
    message: "",
    media: null,
  });

  // View Mode per Album: 'grid' (Visual Drag & Drop) vs 'list' (Detailed Forms)
  // Default to 'grid' for immediate visual recognition and effortless rearranging
  const [albumViewModes, setAlbumViewModes] = useState({});

  // Inline Quick Edit state in Visual Grid: { galleryIndex, imageIndex }
  const [inlineEditingImage, setInlineEditingImage] = useState(null);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAlbumIndex, setPreviewAlbumIndex] = useState(0);
  const [previewViewport, setPreviewViewport] = useState("desktop"); // desktop | tablet | mobile
  const [lightboxImage, setLightboxImage] = useState(null);

  // Drag and Drop state
  const [draggedImage, setDraggedImage] = useState(null); // { galleryIndex, imageIndex }
  const [dragOverImageIndex, setDragOverImageIndex] = useState(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxImage) {
          setLightboxImage(null);
        } else if (inlineEditingImage) {
          setInlineEditingImage(null);
        } else if (isPreviewOpen) {
          setIsPreviewOpen(false);
        } else if (isPrincipalModalOpen) {
          closePrincipalModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, inlineEditingImage, isPreviewOpen, isPrincipalModalOpen]);

  // Helper to update section state
  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  // Gallery Management Functions (Albums)
  const addGallery = () => {
    const galleries = [...(section.galleries || [])];
    galleries.push({
      title: `Gallery ${galleries.length + 1}`,
      description: "",
      layout: "grid",
      images: [],
    });
    onChange({
      ...section,
      galleries,
    });
  };

  const deleteGallery = (galleryIndex) => {
    const galleries = (section.galleries || []).filter(
      (_, i) => i !== galleryIndex
    );
    onChange({
      ...section,
      galleries,
    });
  };

  const updateGallery = (galleryIndex, field, value) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      [field]: value,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  // Move entire album up or down
  const moveGallery = (fromIndex, toIndex) => {
    const galleries = [...(section.galleries || [])];
    if (toIndex < 0 || toIndex >= galleries.length) return;
    const [moved] = galleries.splice(fromIndex, 1);
    galleries.splice(toIndex, 0, moved);
    onChange({
      ...section,
      galleries,
    });
  };

  // Image Management Functions for a specific gallery
  const addImage = (galleryIndex) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: [
        ...(galleries[galleryIndex].images || []),
        {
          media: null,
          caption: "",
          alt: "",
        },
      ],
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const updateImage = (galleryIndex, imageIndex, key, value) => {
    const galleries = [...(section.galleries || [])];
    const updatedImages = [...(galleries[galleryIndex].images || [])];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      [key]: value,
    };
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: updatedImages,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const updateImageWithMedia = (galleryIndex, imageIndex, media) => {
    const galleries = [...(section.galleries || [])];
    const updatedImages = [...(galleries[galleryIndex].images || [])];

    const updatedImage = {
      ...updatedImages[imageIndex],
      media,
    };

    // Auto-fill alt text if not already set
    if (!updatedImages[imageIndex].alt && media?.alt) {
      updatedImage.alt = media.alt;
    }

    updatedImages[imageIndex] = updatedImage;
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: updatedImages,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  const deleteImage = (galleryIndex, imageIndex) => {
    const galleries = [...(section.galleries || [])];
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images: (galleries[galleryIndex].images || []).filter(
        (_, i) => i !== imageIndex
      ),
    };
    onChange({
      ...section,
      galleries,
    });
  };

  // Image Reordering Functions
  const moveImage = (galleryIndex, fromIndex, toIndex) => {
    const galleries = [...(section.galleries || [])];
    const images = [...(galleries[galleryIndex]?.images || [])];
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const [moved] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, moved);
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  // Reverse entire image array (1-click invert)
  const reverseImages = (galleryIndex) => {
    const galleries = [...(section.galleries || [])];
    const images = [...(galleries[galleryIndex]?.images || [])].reverse();
    galleries[galleryIndex] = {
      ...galleries[galleryIndex],
      images,
    };
    onChange({
      ...section,
      galleries,
    });
  };

  // Drag and Drop handlers for image cards & grid tiles
  const handleDragStart = (e, galleryIndex, imageIndex) => {
    setDraggedImage({ galleryIndex, imageIndex });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${galleryIndex}:${imageIndex}`);
  };

  const handleDragOver = (e, galleryIndex, imageIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      !draggedImage ||
      draggedImage.galleryIndex !== galleryIndex ||
      draggedImage.imageIndex === imageIndex
    ) {
      return;
    }
    setDragOverImageIndex(imageIndex);
  };

  const handleDrop = (e, galleryIndex, targetImageIndex) => {
    e.preventDefault();
    if (
      draggedImage &&
      draggedImage.galleryIndex === galleryIndex &&
      draggedImage.imageIndex !== targetImageIndex
    ) {
      moveImage(galleryIndex, draggedImage.imageIndex, targetImageIndex);
    }
    setDraggedImage(null);
    setDragOverImageIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setDragOverImageIndex(null);
  };

  // Principal's Message Handlers
  const openAddPrincipalModal = () => {
    setEditingPrincipalIndex(null);
    setFormError("");
    setPrincipalFormData({
      title: "Principal’s Message",
      name: "",
      designation: "Principal",
      message: "",
      media: null,
    });
    setIsPrincipalModalOpen(true);
  };

  const openEditPrincipalModal = (index) => {
    const item = (section.galleries || [])[index] || {};
    setEditingPrincipalIndex(index);
    setFormError("");
    setPrincipalFormData({
      title: item.title || "Principal’s Message",
      name: item.name || "",
      designation: item.designation || "Principal",
      message: item.message || "",
      media: item.media || null,
    });
    setIsPrincipalModalOpen(true);
  };

  const closePrincipalModal = () => {
    setIsPrincipalModalOpen(false);
    setEditingPrincipalIndex(null);
    setFormError("");
  };

  const handleSavePrincipalMessage = (e) => {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }

    if (!principalFormData.name?.trim()) {
      setFormError("Principal Full Name is required.");
      return;
    }

    if (!principalFormData.message?.trim()) {
      setFormError("Message Content is required.");
      return;
    }

    setFormError("");
    const galleries = [...(section.galleries || [])];

    const blockData = {
      type: "principalMessage",
      id:
        editingPrincipalIndex !== null && galleries[editingPrincipalIndex]?.id
          ? galleries[editingPrincipalIndex].id
          : `pm_${crypto.randomUUID()}`,
      title: principalFormData.title?.trim() || "Principal’s Message",
      name: principalFormData.name?.trim() || "",
      designation: principalFormData.designation?.trim() || "Principal",
      message: principalFormData.message || "",
      media: principalFormData.media || null,
    };

    if (editingPrincipalIndex !== null) {
      galleries[editingPrincipalIndex] = blockData;
    } else {
      galleries.push(blockData);
    }

    onChange({
      ...section,
      galleries,
    });

    closePrincipalModal();
  };

  // Calculate total counts
  const totalAlbums = (section.galleries || []).filter(
    (g) => g.type !== "principalMessage"
  ).length;
  const totalImages = (section.galleries || []).reduce((acc, g) => {
    if (g.type === "principalMessage") return acc;
    return acc + (g.images?.length || 0);
  }, 0);

  return (
    <>
      {/* ============================================================== */}
      {/* TOP HEADER: Section Title & Global Preview Button */}
      {/* ============================================================== */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Gallery Section Title
          </label>
          <input
            type="text"
            value={section.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition"
            placeholder="e.g., Campus Life, Annual Events, or Gallery"
          />
        </div>

        {/* Global Preview Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setPreviewAlbumIndex(0);
              setIsPreviewOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition active:scale-[0.98]"
            title="Preview the entire gallery and images as visitors will see them"
          >
            <Eye size={16} className="text-amber-400" />
            <span>Preview Gallery</span>
            <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full ml-0.5">
              {totalImages} {totalImages === 1 ? "img" : "imgs"}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GALLERIES / ALBUMS LIST */}
      {/* ============================================================== */}
      <div className="space-y-10">
        {(section.galleries || []).map((item, galleryIndex) => {
          // Check if this item is a Principal's Message block
          if (item.type === "principalMessage") {
            return (
              <div
                key={item.id || galleryIndex}
                className="border rounded-2xl p-6 sm:p-8 bg-amber-50/40 border-amber-200/80 relative"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                      Principal’s Message
                    </span>
                    <h3 className="font-['Fraunces'] text-xl sm:text-2xl text-[#2A2623]">
                      {item.title || "Principal’s Message"}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up / Down */}
                    {(section.galleries || []).length > 1 && (
                      <div className="inline-flex items-center bg-white border border-amber-300/70 rounded-lg shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => moveGallery(galleryIndex, galleryIndex - 1)}
                          disabled={galleryIndex === 0}
                          className="p-1.5 text-amber-900 hover:bg-amber-100 disabled:opacity-30 disabled:pointer-events-none transition border-r border-amber-200"
                          title="Move Block Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGallery(galleryIndex, galleryIndex + 1)}
                          disabled={galleryIndex === (section.galleries || []).length - 1}
                          className="p-1.5 text-amber-900 hover:bg-amber-100 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Move Block Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditPrincipalModal(galleryIndex)}
                      className="px-3.5 py-1.5 text-xs font-medium bg-white text-gray-700 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                      Edit Block
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGallery(galleryIndex)}
                      className="px-3.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                    >
                      Delete Block
                    </button>
                  </div>
                </div>

                {/* Content preview */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Photo Thumbnail */}
                  <div className="w-24 h-32 shrink-0 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                    {item.media?.url ? (
                      <img
                        src={getCleanImageUrl(item.media.url)}
                        alt={item.name || "Principal"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-gray-400">
                        <span className="block text-2xl mb-1">👤</span>
                        <span className="text-[10px]">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-['Fraunces'] text-lg font-medium text-gray-900">
                      {item.name || (
                        <span className="text-gray-400 italic">No name provided</span>
                      )}
                    </div>
                    <div className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-[#8A6B3F] font-semibold">
                      {item.designation || "Principal"}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 pt-2 font-['Inter'] leading-relaxed">
                      {item.message || (
                        <span className="text-gray-400 italic">
                          No message content entered yet.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // Otherwise render Gallery Album item
          const gallery = item;
          const images = gallery.images || [];
          const imageCount = images.length;
          // View mode: 'grid' (Visual Grid) vs 'list' (Detailed List)
          const currentViewMode = albumViewModes[galleryIndex] || "grid";

          return (
            <div
              key={galleryIndex}
              className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-gray-50/50 relative shadow-sm hover:border-neutral-300 transition"
            >
              {/* Album Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    {galleryIndex + 1}
                  </span>
                  <h3 className="font-['Fraunces'] text-xl sm:text-2xl text-[#2A2623] truncate">
                    {gallery.title || `Gallery ${galleryIndex + 1}`}
                  </h3>
                  <span className="text-xs font-semibold text-gray-700 bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full shrink-0 border border-amber-200">
                    {imageCount} {imageCount === 1 ? "photo" : "photos"}
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {/* View Mode Toggle: Visual Drag & Drop Grid vs Detailed List */}
                  {imageCount > 0 && (
                    <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setAlbumViewModes((prev) => ({
                            ...prev,
                            [galleryIndex]: "grid",
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          currentViewMode === "grid"
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "text-gray-600 hover:text-black hover:bg-gray-100"
                        }`}
                        title="Visual photo grid with click-and-drag reordering"
                      >
                        <LayoutGrid size={13} />
                        <span>Visual Drag Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAlbumViewModes((prev) => ({
                            ...prev,
                            [galleryIndex]: "list",
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          currentViewMode === "list"
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "text-gray-600 hover:text-black hover:bg-gray-100"
                        }`}
                        title="Detailed form fields for captions, alt text, and replacement"
                      >
                        <List size={13} />
                        <span>Detailed Form List</span>
                      </button>
                    </div>
                  )}

                  {/* 1-Click Reverse Order */}
                  {imageCount > 1 && (
                    <button
                      type="button"
                      onClick={() => reverseImages(galleryIndex)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
                      title="Reverse sequence of all images in this album"
                    >
                      <RotateCcw size={12} className="text-gray-500" />
                      <span>Reverse Order</span>
                    </button>
                  )}

                  {/* Preview This Album */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAlbumIndex(galleryIndex);
                      setIsPreviewOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-800 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
                    title="Preview this album and images exactly as rendered on page"
                  >
                    <Eye size={13} className="text-amber-600" />
                    <span>Preview Album</span>
                  </button>

                  {/* Album Reorder Up / Down */}
                  {(section.galleries || []).length > 1 && (
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => moveGallery(galleryIndex, galleryIndex - 1)}
                        disabled={galleryIndex === 0}
                        className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition border-r border-gray-200"
                        title="Move Album Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(galleryIndex, galleryIndex + 1)}
                        disabled={
                          galleryIndex === (section.galleries || []).length - 1
                        }
                        className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Move Album Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  )}

                  {/* Delete Album */}
                  <button
                    type="button"
                    onClick={() => deleteGallery(galleryIndex)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition text-xs font-medium"
                  >
                    Delete Album
                  </button>
                </div>
              </div>

              {/* Album Title, Description & Layout Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Album Title
                  </label>
                  <input
                    type="text"
                    value={gallery.title || ""}
                    onChange={(e) =>
                      updateGallery(galleryIndex, "title", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white"
                    placeholder="e.g., Annual Day 2026, Sports Meet"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Display Layout
                  </label>
                  <select
                    value={gallery.layout || "grid"}
                    onChange={(e) =>
                      updateGallery(galleryIndex, "layout", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white"
                  >
                    <option value="grid">Grid (Clean multi-column responsive layout)</option>
                    <option value="masonry">Masonry (Pinterest-style dynamic heights)</option>
                    <option value="slider">Slider (Horizontal scrollable carousel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Album Description
                  </label>
                  <input
                    type="text"
                    value={gallery.description || ""}
                    onChange={(e) =>
                      updateGallery(galleryIndex, "description", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white font-['Inter']"
                    placeholder="Brief description of this album..."
                  />
                </div>
              </div>

              {/* ========================================================== */}
              {/* VIEW 1: VISUAL DRAG & DROP PHOTO GRID (DEFAULT)             */}
              {/* Shows ALL ACTUAL PHOTOS clearly side-by-side with click &   */}
              {/* drag reordering, position dropdowns, and arrow controls!   */}
              {/* ========================================================== */}
              {currentViewMode === "grid" ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                  {/* Instructions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <GripVertical size={14} className="text-amber-500" />
                        Click & Drag Photos to Rearrange
                      </span>
                      <span>
                        • You can drag any photo tile, or use arrows (← / →), or jump using the Position dropdown
                      </span>
                    </div>

                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {imageCount} {imageCount === 1 ? "photo" : "photos"} total
                    </span>
                  </div>

                  {images.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                      No images added to this album yet. Click "+ Add Image" below to upload photos.
                    </div>
                  ) : (
                    /* Responsive Grid of Real Photos */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                      {images.map((image, imageIndex) => {
                        const imgUrl = resolveImageUrl(image);
                        const isDraggingOver =
                          dragOverImageIndex === imageIndex &&
                          draggedImage?.galleryIndex === galleryIndex;
                        const isCurrentDragged =
                          draggedImage?.galleryIndex === galleryIndex &&
                          draggedImage?.imageIndex === imageIndex;

                        return (
                          <div
                            key={imageIndex}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, galleryIndex, imageIndex)
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, galleryIndex, imageIndex)
                            }
                            onDragEnd={handleDragEnd}
                            onDrop={(e) =>
                              handleDrop(e, galleryIndex, imageIndex)
                            }
                            className={`group relative rounded-xl border bg-white overflow-hidden shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing flex flex-col justify-between ${
                              isDraggingOver
                                ? "border-amber-500 ring-4 ring-amber-300 scale-[1.03] z-20 shadow-lg bg-amber-50/20"
                                : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                            } ${
                              isCurrentDragged
                                ? "opacity-25 border-dashed border-gray-500 scale-95"
                                : "opacity-100"
                            }`}
                          >
                            {/* Card Top: Drag Handle, Number Badge, Position Dropdown & Delete */}
                            <div className="p-2 flex items-center justify-between gap-1 bg-gray-50/90 border-b border-gray-100 select-none">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="bg-neutral-900 text-white text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  #{imageIndex + 1}
                                </span>
                                <GripVertical
                                  size={13}
                                  className="text-gray-400 group-hover:text-gray-700"
                                />
                              </div>

                              {/* Teleport Dropdown (Select Any Position from 1 to N) */}
                              <div className="flex items-center gap-1">
                                <select
                                  value={imageIndex}
                                  onChange={(e) =>
                                    moveImage(
                                      galleryIndex,
                                      imageIndex,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-white border border-gray-300 text-[11px] font-semibold text-gray-700 rounded px-1.5 py-0.5 hover:border-gray-500 cursor-pointer focus:outline-none"
                                  title="Jump directly to position number"
                                >
                                  {images.map((_, idx) => (
                                    <option key={idx} value={idx}>
                                      #{idx + 1}
                                    </option>
                                  ))}
                                </select>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(galleryIndex, imageIndex);
                                  }}
                                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="Delete image"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Actual Photo Container */}
                            <div
                              className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer"
                              onClick={() => {
                                if (imgUrl) {
                                  setLightboxImage({
                                    url: imgUrl,
                                    alt: image.alt,
                                    caption:
                                      image.caption ||
                                      `Photo #${imageIndex + 1}`,
                                  });
                                }
                              }}
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={image.alt || "Gallery Photo"}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    if (!e.currentTarget.dataset.retried) {
                                      e.currentTarget.dataset.retried = "true";
                                      e.currentTarget.src = "/uploads/event1.jpg";
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2 text-center">
                                  <ImageIcon size={22} className="mb-1 text-gray-300" />
                                  <span className="text-[10px]">No photo</span>
                                </div>
                              )}

                              {/* Hover Zoom Icon */}
                              {imgUrl && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <span className="p-1.5 rounded-full bg-white/90 text-gray-900 shadow-sm">
                                    <Maximize2 size={13} />
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Caption & Navigation Controls */}
                            <div className="p-2 bg-white flex flex-col justify-between">
                              {/* Caption snippet or prompt */}
                              <div className="mb-1.5">
                                {image.caption ? (
                                  <p
                                    className="text-[11px] font-medium text-gray-800 truncate"
                                    title={image.caption}
                                  >
                                    {image.caption}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic truncate">
                                    No caption
                                  </p>
                                )}
                              </div>

                              {/* Action Arrow Buttons (Left / Right / Jump to Ends) */}
                              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-100">
                                {/* Jump to First */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(galleryIndex, imageIndex, 0);
                                  }}
                                  disabled={imageIndex === 0}
                                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-20 disabled:pointer-events-none transition"
                                  title="Jump to First (#1)"
                                >
                                  <ChevronsLeft size={12} />
                                </button>

                                {/* Step Left (Earlier) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(
                                      galleryIndex,
                                      imageIndex,
                                      imageIndex - 1
                                    );
                                  }}
                                  disabled={imageIndex === 0}
                                  className="flex-1 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-20 disabled:pointer-events-none text-[11px] font-semibold flex items-center justify-center gap-0.5 transition"
                                  title="Move Left"
                                >
                                  <ChevronLeft size={13} />
                                  <span>Left</span>
                                </button>

                                {/* Step Right (Later) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(
                                      galleryIndex,
                                      imageIndex,
                                      imageIndex + 1
                                    );
                                  }}
                                  disabled={imageIndex === imageCount - 1}
                                  className="flex-1 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-20 disabled:pointer-events-none text-[11px] font-semibold flex items-center justify-center gap-0.5 transition"
                                  title="Move Right"
                                >
                                  <span>Right</span>
                                  <ChevronRight size={13} />
                                </button>

                                {/* Jump to Last */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(
                                      galleryIndex,
                                      imageIndex,
                                      imageCount - 1
                                    );
                                  }}
                                  disabled={imageIndex === imageCount - 1}
                                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-20 disabled:pointer-events-none transition"
                                  title="Jump to Last"
                                >
                                  <ChevronsRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ======================================================== */
                /* VIEW 2: DETAILED FORM LIST (FOR CAPTIONS / ALT / MEDIA)    */
                /* ======================================================== */
                <div className="space-y-5">
                  {images.map((image, imageIndex) => {
                    const imgUrl = resolveImageUrl(image);
                    const isDraggingOver =
                      dragOverImageIndex === imageIndex &&
                      draggedImage?.galleryIndex === galleryIndex;
                    const isCurrentDragged =
                      draggedImage?.galleryIndex === galleryIndex &&
                      draggedImage?.imageIndex === imageIndex;

                    return (
                      <div
                        key={imageIndex}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, galleryIndex, imageIndex)
                        }
                        onDragOver={(e) =>
                          handleDragOver(e, galleryIndex, imageIndex)
                        }
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, galleryIndex, imageIndex)}
                        className={`border rounded-2xl p-5 sm:p-6 bg-white transition-all duration-150 relative shadow-sm ${
                          isDraggingOver
                            ? "border-amber-500 ring-2 ring-amber-300 bg-amber-50/20 scale-[1.01]"
                            : "border-gray-200 hover:border-gray-300"
                        } ${isCurrentDragged ? "opacity-30 scale-95" : "opacity-100"}`}
                      >
                        {/* Image Card Top Bar: Handle, Thumbnail, Index & Position Dropdown */}
                        <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-100 select-none">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Drag Handle */}
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition"
                              title="Drag to rearrange image order"
                            >
                              <GripVertical size={16} />
                            </div>

                            {/* Mini Thumbnail */}
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={image.alt || "Thumbnail"}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100 shadow-xs cursor-pointer"
                                onClick={() =>
                                  setLightboxImage({
                                    url: imgUrl,
                                    alt: image.alt,
                                    caption: image.caption,
                                  })
                                }
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0 text-gray-400 text-xs">
                                <ImageIcon size={16} />
                              </div>
                            )}

                            {/* Image Index & Position Teleport */}
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900 text-sm">
                                Image {imageIndex + 1}
                              </h5>
                              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                #{imageIndex + 1} of {imageCount}
                              </span>
                            </div>
                          </div>

                          {/* Reordering Controls + Position Dropdown + Delete */}
                          <div className="flex items-center gap-2">
                            {/* Position Dropdown */}
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-400 text-[11px]">Position:</span>
                              <select
                                value={imageIndex}
                                onChange={(e) =>
                                  moveImage(
                                    galleryIndex,
                                    imageIndex,
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-2 py-1 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-black cursor-pointer"
                                title="Jump directly to position"
                              >
                                {images.map((_, idx) => (
                                  <option key={idx} value={idx}>
                                    #{idx + 1} {idx === 0 ? "(First)" : idx === imageCount - 1 ? "(Last)" : ""}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Move Up */}
                            <button
                              type="button"
                              onClick={() =>
                                moveImage(galleryIndex, imageIndex, imageIndex - 1)
                              }
                              disabled={imageIndex === 0}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-25 disabled:pointer-events-none transition"
                              title="Move Image Up"
                            >
                              <ArrowUp size={14} />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              onClick={() =>
                                moveImage(galleryIndex, imageIndex, imageIndex + 1)
                              }
                              disabled={imageIndex === imageCount - 1}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-25 disabled:pointer-events-none transition"
                              title="Move Image Down"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => deleteImage(galleryIndex, imageIndex)}
                              className="ml-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Media Picker */}
                        <div className="mb-5">
                          <MediaPicker
                            type="image"
                            multiple={false}
                            value={image.media}
                            onChange={(media) =>
                              updateImageWithMedia(
                                galleryIndex,
                                imageIndex,
                                media
                              )
                            }
                          />
                        </div>

                        {/* Caption */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                            Caption / Subtitle
                          </label>
                          <input
                            type="text"
                            value={image.caption || ""}
                            onChange={(e) =>
                              updateImage(
                                galleryIndex,
                                imageIndex,
                                "caption",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                            placeholder="e.g. Science Exhibition Winners 2026"
                          />
                        </div>

                        {/* Alt Text */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                            Alt Text (For accessibility & SEO)
                          </label>
                          <input
                            type="text"
                            value={image.alt || ""}
                            onChange={(e) =>
                              updateImage(
                                galleryIndex,
                                imageIndex,
                                "alt",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                            placeholder="Describe the image content..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Image Button Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => addImage(galleryIndex)}
                  className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl transition text-sm font-medium shadow-sm flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Add Image</span>
                </button>

                {imageCount > 1 && currentViewMode === "list" && (
                  <button
                    type="button"
                    onClick={() =>
                      setAlbumViewModes((prev) => ({
                        ...prev,
                        [galleryIndex]: "grid",
                      }))
                    }
                    className="px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-xl transition text-sm font-medium shadow-sm flex items-center gap-2"
                  >
                    <LayoutGrid size={14} className="text-amber-600" />
                    <span>Switch to Visual Drag Grid ({imageCount} Photos)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* EMPTY STATE */}
      {/* ============================================================== */}
      {(section.galleries || []).length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            No gallery content yet. Choose an option to add content:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={addGallery}
              className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition font-medium text-sm shadow-sm"
            >
              + Add Gallery Album
            </button>
            <button
              type="button"
              onClick={openAddPrincipalModal}
              className="px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
            >
              <span>🎓</span>
              <span>+ Add Principal’s Message</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ACTION CONTROLS WHEN ITEMS EXIST */}
      {/* ============================================================== */}
      {(section.galleries || []).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addGallery}
              className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition font-medium text-sm shadow-sm"
            >
              + Add Gallery Album
            </button>
            <button
              type="button"
              onClick={openAddPrincipalModal}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium text-sm flex items-center gap-2 shadow-sm"
            >
              <span>🎓</span>
              <span>+ Add Principal’s Message</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setPreviewAlbumIndex(0);
              setIsPreviewOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Eye size={15} className="text-amber-600" />
            <span>Preview Gallery & Images</span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* INTERACTIVE GALLERY & IMAGES PREVIEW MODAL */}
      {/* ============================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-neutral-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-neutral-200 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-['Fraunces']">
                    Gallery Section Preview
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {totalAlbums} {totalAlbums === 1 ? "Album" : "Albums"} •{" "}
                    {totalImages} {totalImages === 1 ? "Image" : "Images"}
                  </p>
                </div>
              </div>

              {/* Viewport controls (Desktop / Tablet / Mobile) */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      previewViewport === "desktop"
                        ? "bg-white text-black shadow-xs font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("tablet")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      previewViewport === "tablet"
                        ? "bg-white text-black shadow-xs font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <Tablet size={14} />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      previewViewport === "mobile"
                        ? "bg-white text-black shadow-xs font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Album Tabs (if multiple albums) */}
            {(section.galleries || []).length > 1 && (
              <div className="bg-neutral-50 px-4 sm:px-6 py-2.5 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-2 shrink-0">
                  View Album:
                </span>
                {(section.galleries || []).map((album, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewAlbumIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      previewAlbumIndex === idx
                        ? "bg-neutral-900 text-white shadow-xs font-semibold"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {album.type === "principalMessage"
                      ? "🎓 Principal’s Message"
                      : album.title || `Gallery ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Preview Frame Body */}
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#FDFBF7] flex justify-center">
              <div
                className={`w-full transition-all duration-300 ${
                  previewViewport === "mobile"
                    ? "max-w-[390px] border-x border-neutral-300 bg-white shadow-xl px-4 py-6 rounded-3xl min-h-[600px]"
                    : previewViewport === "tablet"
                    ? "max-w-[768px] border-x border-neutral-200 bg-white shadow-md px-6 py-8 rounded-2xl"
                    : "max-w-5xl bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm"
                }`}
              >
                {/* Public Website Gallery Presentation */}
                {/* 1. Section Eyebrow & Title */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A47A2D] block mb-2 font-mono">
                    Gallery
                  </span>
                  <h2 className="font-['Fraunces'] text-2xl sm:text-4xl text-[#292622] font-semibold">
                    {section.title || "Campus Gallery"}
                  </h2>
                  <div className="w-12 h-0.5 bg-[#C99A3C] rounded-full mx-auto mt-4" />
                </div>

                {/* 2. Active Album / Content Item */}
                {(() => {
                  const activeItem =
                    section.galleries?.[previewAlbumIndex] ||
                    section.galleries?.[0];

                  if (!activeItem) {
                    return (
                      <div className="text-center py-16 text-gray-400">
                        No gallery albums or images configured yet.
                      </div>
                    );
                  }

                  // If Principal's Message
                  if (activeItem.type === "principalMessage") {
                    const photoUrl = resolveImageUrl(activeItem);
                    const paragraphs = (activeItem.message || "")
                      .split(/\n+/)
                      .map((p) => p.trim())
                      .filter(Boolean);

                    return (
                      <div className="bg-[#FAF8F5] border border-[#E6DED3] rounded-2xl p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6 items-start">
                          <div className="aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shadow-sm">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={activeItem.name || "Principal"}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() =>
                                  setLightboxImage({
                                    url: photoUrl,
                                    alt: activeItem.name,
                                    caption: `${activeItem.name} - ${activeItem.designation}`,
                                  })
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                👤
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs uppercase font-mono tracking-wider text-[#A47A2D] font-semibold block mb-1">
                              Institutional Leadership
                            </span>
                            <h3 className="font-['Fraunces'] text-2xl text-gray-900 font-semibold">
                              {activeItem.title || "Principal’s Message"}
                            </h3>
                            <h4 className="text-sm font-semibold text-gray-800 mt-1">
                              {activeItem.name}
                            </h4>
                            <p className="text-xs text-gray-500 font-mono mb-4">
                              {activeItem.designation || "Principal"}
                            </p>
                            <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-['Inter']">
                              {paragraphs.map((p, idx) => (
                                <p key={idx}>{p}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Standard Gallery Album
                  const activeImages = activeItem.images || [];

                  return (
                    <div>
                      {/* Album Heading */}
                      {(activeItem.title || activeItem.description) && (
                        <div className="mb-8 pb-4 border-b border-neutral-100">
                          {activeItem.title && (
                            <h3 className="font-['Fraunces'] text-xl sm:text-2xl text-[#292622] font-semibold">
                              {activeItem.title}
                            </h3>
                          )}
                          {activeItem.description && (
                            <p className="mt-1 text-sm text-gray-600 font-['Inter'] leading-relaxed max-w-3xl">
                              {activeItem.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Images Display by Layout */}
                      {activeImages.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                          No images uploaded to this album yet.
                        </div>
                      ) : activeItem.layout === "slider" ? (
                        /* SLIDER LAYOUT PREVIEW */
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
                          {activeImages.map((img, i) => {
                            const url = resolveImageUrl(img);
                            return (
                              <div
                                key={i}
                                className="min-w-[280px] sm:min-w-[340px] rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs group cursor-pointer"
                                onClick={() =>
                                  url &&
                                  setLightboxImage({
                                    url,
                                    alt: img.alt,
                                    caption: img.caption,
                                  })
                                }
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                  {url ? (
                                    <img
                                      src={url}
                                      alt={img.alt || ""}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      Empty image slot #{i + 1}
                                    </div>
                                  )}
                                </div>
                                {(img.caption || img.alt) && (
                                  <div className="p-3">
                                    {img.caption && (
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {img.caption}
                                      </p>
                                    )}
                                    {img.alt && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {img.alt}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : activeItem.layout === "masonry" ? (
                        /* MASONRY LAYOUT PREVIEW */
                        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
                          {activeImages.map((img, i) => {
                            const url = resolveImageUrl(img);
                            return (
                              <div
                                key={i}
                                className="break-inside-avoid rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs group cursor-pointer"
                                onClick={() =>
                                  url &&
                                  setLightboxImage({
                                    url,
                                    alt: img.alt,
                                    caption: img.caption,
                                  })
                                }
                              >
                                <div className="w-full overflow-hidden bg-gray-100">
                                  {url ? (
                                    <img
                                      src={url}
                                      alt={img.alt || ""}
                                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="h-40 flex items-center justify-center text-gray-400 text-xs">
                                      Empty image slot #{i + 1}
                                    </div>
                                  )}
                                </div>
                                {(img.caption || img.alt) && (
                                  <div className="p-3">
                                    {img.caption && (
                                      <p className="text-sm font-medium text-gray-900">
                                        {img.caption}
                                      </p>
                                    )}
                                    {img.alt && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {img.alt}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* GRID LAYOUT PREVIEW (DEFAULT) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {activeImages.map((img, i) => {
                            const url = resolveImageUrl(img);
                            return (
                              <div
                                key={i}
                                className="rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs group cursor-pointer transition hover:shadow-md"
                                onClick={() =>
                                  url &&
                                  setLightboxImage({
                                    url,
                                    alt: img.alt,
                                    caption: img.caption,
                                  })
                                }
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                                  {url ? (
                                    <img
                                      src={url}
                                      alt={img.alt || ""}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      Empty image slot #{i + 1}
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="p-2 rounded-full bg-white/90 text-gray-900 shadow-sm">
                                      <Maximize2 size={16} />
                                    </span>
                                  </div>
                                </div>
                                {(img.caption || img.alt) && (
                                  <div className="p-3">
                                    {img.caption && (
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {img.caption}
                                      </p>
                                    )}
                                    {img.alt && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {img.alt}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                Click any image in preview to zoom full size
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FULLSCREEN LIGHTBOX ZOOM OVERLAY */}
      {/* ============================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
          >
            <X size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt || "Preview"}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            {(lightboxImage.caption || lightboxImage.alt) && (
              <div className="mt-4 text-center">
                {lightboxImage.caption && (
                  <p className="text-white text-base font-medium">
                    {lightboxImage.caption}
                  </p>
                )}
                {lightboxImage.alt && (
                  <p className="text-neutral-400 text-xs mt-1">
                    {lightboxImage.alt}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEDICATED PRINCIPAL'S MESSAGE MODAL */}
      {/* ============================================================== */}
      {isPrincipalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  🎓
                </div>
                <h3 className="text-lg font-bold text-neutral-900 font-['Fraunces']">
                  {editingPrincipalIndex !== null
                    ? "Edit Principal’s Message"
                    : "Add Principal’s Message"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePrincipalModal}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 space-y-5">
              {/* Form Error Message */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Principal Image via MediaPicker */}
              <div>
                <MediaPicker
                  type="image"
                  label="Principal Photo"
                  multiple={false}
                  value={principalFormData.media}
                  onChange={(media) =>
                    setPrincipalFormData((prev) => ({ ...prev, media }))
                  }
                />
              </div>

              {/* Name & Designation grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Principal Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={principalFormData.name}
                    onChange={(e) => {
                      setFormError("");
                      setPrincipalFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="e.g. Prof.(Dr.) Annie Rajan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={principalFormData.designation}
                    onChange={(e) =>
                      setPrincipalFormData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="e.g. Principal"
                  />
                </div>
              </div>

              {/* Block / Heading Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Heading / Title
                </label>
                <input
                  type="text"
                  value={principalFormData.title}
                  onChange={(e) =>
                    setPrincipalFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. Principal’s Message"
                />
              </div>

              {/* Message content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Message Content <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    Supports multiple paragraphs (double line break)
                  </span>
                </div>
                <textarea
                  required
                  value={principalFormData.message}
                  onChange={(e) => {
                    setFormError("");
                    setPrincipalFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }));
                  }}
                  className="w-full border rounded-xl px-4 py-3 text-sm min-h-[200px] resize-y font-['Inter'] leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Enter the welcome introduction, message paragraphs, and closing statement..."
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closePrincipalModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePrincipalMessage}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-medium transition shadow-sm"
                >
                  {editingPrincipalIndex !== null
                    ? "Update Message"
                    : "Save Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryEditor;