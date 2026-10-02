import MediaPicker from "../media/components/MediaPicker";
import {
  Calendar,
  FileText,
  Users,
  Download,
  Clock,
  MapPin,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Globe,
  Building,
  Mail,
  Phone,
  Layers,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Info,
  Wand2,
} from "lucide-react";

const COMMON_HERO_ICONS = [
  { name: "Calendar", label: "Calendar", icon: Calendar },
  { name: "FileText", label: "Document", icon: FileText },
  { name: "Users", label: "Users / People", icon: Users },
  { name: "Download", label: "Download", icon: Download },
  { name: "Clock", label: "Clock / Duration", icon: Clock },
  { name: "MapPin", label: "Location", icon: MapPin },
  { name: "Award", label: "Award / Degree", icon: Award },
  { name: "BookOpen", label: "Book / Curriculum", icon: BookOpen },
  { name: "GraduationCap", label: "Graduation", icon: GraduationCap },
  { name: "Sparkles", label: "Sparkles", icon: Sparkles },
  { name: "CheckCircle", label: "Checkmark", icon: CheckCircle },
  { name: "Globe", label: "Globe / Web", icon: Globe },
  { name: "Building", label: "Campus / Building", icon: Building },
  { name: "Mail", label: "Email", icon: Mail },
  { name: "Phone", label: "Phone", icon: Phone },
  { name: "Layers", label: "Layers", icon: Layers },
];

const ACADEMIC_PRESET_ITEMS = [
  { icon: "Calendar", label: "COVERS", value: "All Academic Years" },
  { icon: "FileText", label: "INCLUDES", value: "Term Dates, Exams, Vacations & Events" },
  { icon: "Users", label: "FOR", value: "Students, Faculty & Staff" },
  { icon: "Download", label: "FORMAT", value: "PDF Documents" },
];

const HeroEditor = ({
  section,
  onChange,
  mode = "page", // "page" | "home"
}) => {
  const isHome = mode === "home";

  /* ==========================================
      UPDATE FIELD
  ========================================== */

  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  /* ==========================================
      QUICK INFO / HIGHLIGHTS FUNCTIONS
  ========================================== */

  const quickInfoItems = Array.isArray(section.quickInfo)
    ? section.quickInfo
    : Array.isArray(section.highlights)
    ? section.highlights
    : Array.isArray(section.stats)
    ? section.stats
    : [];

  const updateQuickInfoItem = (index, key, value) => {
    const updated = [...quickInfoItems];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    updateField("quickInfo", updated);
  };

  const addQuickInfoItem = () => {
    const updated = [
      ...quickInfoItems,
      {
        icon: "Calendar",
        label: "",
        value: "",
      },
    ];
    updateField("quickInfo", updated);
  };

  const removeQuickInfoItem = (index) => {
    const updated = quickInfoItems.filter((_, i) => i !== index);
    updateField("quickInfo", updated);
  };

  const loadPreset = () => {
    updateField("quickInfo", ACADEMIC_PRESET_ITEMS);
  };

  /* ==========================================
      SLIDE FUNCTIONS (for carousel mode)
  ========================================== */

  const slides = section.slides || [];

  const updateSlide = (index, key, value) => {
    const updated = [...slides];
    updated[index][key] = value;
    updateField("slides", updated);
  };

  const addSlide = () => {
    updateField("slides", [
      ...slides,
      {
        image: "",
        caption: "",
        description: "",
      },
    ]);
  };

  const deleteSlide = (index) => {
    if (!window.confirm("Delete this slide?")) return;
    updateField(
      "slides",
      slides.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* ======================================
          EYEBROW & TITLE
      ====================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isHome && (
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Eyebrow / Kicker (Gold Accent)
            </label>
            <input
              type="text"
              value={section.eyebrow || section.kicker || ""}
              onChange={(e) => updateField("eyebrow", e.target.value)}
              placeholder="Enter eyebrow kicker (optional)"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Main Title / Heading
          </label>
          <input
            type="text"
            value={section.heading || ""}
            onChange={(e) => updateField("heading", e.target.value)}
            placeholder="Enter title / heading"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
          />
        </div>
      </div>

      {/* ======================================
          SUBTITLE (PAGE ONLY)
      ====================================== */}
      {!isHome && (
        <div>
          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Subtitle / Description
          </label>
          <textarea
            rows={3}
            value={section.subheading || ""}
            onChange={(e) => updateField("subheading", e.target.value)}
            placeholder="Enter subtitle description (optional)"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
          />
        </div>
      )}

      {/* ======================================
          PAGE-ONLY: Alignment & Height Controls
      ====================================== */}
      {!isHome && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/80 p-5 rounded-xl border border-gray-200/80">
          {/* Alignment Segmented Control */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              Content Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateField("alignment", "left")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  (section.alignment || "left") === "left"
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <AlignLeft size={15} />
                <span>Left (Image style)</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("alignment", "center")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  section.alignment === "center"
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <AlignCenter size={15} />
                <span>Center</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("alignment", "right")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  section.alignment === "right"
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <AlignRight size={15} />
                <span>Right</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Left alignment positions content on the left as in the reference image.
            </p>
          </div>

          {/* Hero Height */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              Hero Height
            </label>
            <select
              value={section.height || "medium"}
              onChange={(e) => updateField("height", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white font-medium"
            >
              <option value="small">Small Banner (Compact)</option>
              <option value="medium">Medium Banner (Standard Default)</option>
              <option value="large">Large Banner (Spacious)</option>
              <option value="fullscreen">Full Screen</option>
            </select>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Controls the height and padding of the hero container.
            </p>
          </div>
        </div>
      )}

      {/* ======================================
          NEW: QUICK INFO / HIGHLIGHTS STRIP MANAGER
      ====================================== */}
      {!isHome && (
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[#C9A555]" />
                Quick Info / Highlights Bar (Bottom Strip)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Add metadata columns below the heading & subtitle (e.g. Covers, Includes, For, Format).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadPreset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8A6B3F] bg-[#FAF6EE] hover:bg-[#F3EADB] border border-[#E4D5B7] rounded-lg transition-colors"
                title="Load 4 Academic Calendar reference items"
              >
                <Wand2 size={13} />
                Load Academic Preset
              </button>

              <button
                type="button"
                onClick={addQuickInfoItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>
          </div>

          {quickInfoItems.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Info size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs font-medium text-gray-600">No highlights added for this page.</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                Click &quot;Add Item&quot; to add custom metadata items or &quot;Load Academic Preset&quot; to load the reference elements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickInfoItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3.5 rounded-xl border border-gray-200 bg-gray-50/40 hover:bg-gray-50 transition-colors"
                >
                  {/* Icon Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Icon
                    </label>
                    <select
                      value={item.icon || "Calendar"}
                      onChange={(e) => updateQuickInfoItem(index, "icon", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-medium outline-none focus:border-black"
                    >
                      {COMMON_HERO_ICONS.map((ico) => (
                        <option key={ico.name} value={ico.name}>
                          {ico.name} ({ico.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Label */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={item.label || ""}
                      onChange={(e) => updateQuickInfoItem(index, "label", e.target.value)}
                      placeholder="e.g. COVERS"
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold uppercase tracking-wider outline-none focus:border-black"
                    />
                  </div>

                  {/* Value */}
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Value / Description
                    </label>
                    <input
                      type="text"
                      value={item.value || ""}
                      onChange={(e) => updateQuickInfoItem(index, "value", e.target.value)}
                      placeholder="e.g. All Academic Years"
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-medium outline-none focus:border-black"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 flex justify-end pt-3 md:pt-4">
                    <button
                      type="button"
                      onClick={() => removeQuickInfoItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================
          BACK LINK & WATERMARK SETTINGS (PAGE ONLY)
      ====================================== */}
      {!isHome && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Back Link */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Top Back Link (e.g. ← Back to Academics)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Link Text
                </label>
                <input
                  type="text"
                  value={section.backLinkText || ""}
                  onChange={(e) => updateField("backLinkText", e.target.value)}
                  placeholder="e.g. Back to Academics (optional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Link URL
                </label>
                <input
                  type="text"
                  value={section.backLinkUrl || ""}
                  onChange={(e) => updateField("backLinkUrl", e.target.value)}
                  placeholder="e.g. /academics (optional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Decorative Right Watermark */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Right-Side Decorative Watermark
              </h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={section.showWatermark !== false}
                  onChange={(e) => updateField("showWatermark", e.target.checked)}
                  className="accent-black rounded"
                />
                <span>Enable</span>
              </label>
            </div>

            {section.showWatermark !== false && (
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Insignia Year / Foundation Year
                  </label>
                  <input
                    type="text"
                    value={section.watermarkYear || ""}
                    onChange={(e) => updateField("watermarkYear", e.target.value)}
                    placeholder="e.g. 1985"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Vertical Motto Words (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={section.watermarkTagline || ""}
                    onChange={(e) => updateField("watermarkTagline", e.target.value)}
                    placeholder="LEARN&#10;GROW&#10;BELONG"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none resize-none focus:border-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
          CTA BUTTONS
      ====================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Button */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <h4 className="text-sm font-semibold mb-4 text-gray-900">
            Primary Button
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Button Text
              </label>
              <input
                value={section.primaryButtonText || ""}
                onChange={(e) => updateField("primaryButtonText", e.target.value)}
                placeholder="Learn More"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Button Link
              </label>
              <input
                value={section.primaryButtonLink || ""}
                onChange={(e) => updateField("primaryButtonLink", e.target.value)}
                placeholder="/about"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Secondary Button */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <h4 className="text-sm font-semibold mb-4 text-gray-900">
            Secondary Button
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Button Text
              </label>
              <input
                value={section.secondaryButtonText || ""}
                onChange={(e) => updateField("secondaryButtonText", e.target.value)}
                placeholder="Contact Us"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Button Link
              </label>
              <input
                value={section.secondaryButtonLink || ""}
                onChange={(e) => updateField("secondaryButtonLink", e.target.value)}
                placeholder="/contact"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          BACKGROUND / CAROUSEL SECTION
      ====================================== */}
      {isHome ? (
        // Home mode - Carousel Slides
        <div className="space-y-6">
          <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Slides
          </label>

          {slides.map((slide, index) => (
            <div key={index} className="border rounded-2xl p-6 bg-white space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Slide {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => deleteSlide(index)}
                  className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              <MediaPicker
                type="image"
                value={slide.image || null}
                onChange={(media) => updateSlide(index, "image", media)}
              />

              <div>
                <label className="block text-sm font-semibold mb-2">Caption</label>
                <input
                  value={slide.caption || ""}
                  onChange={(e) => updateSlide(index, "caption", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  rows={3}
                  value={slide.description || ""}
                  onChange={(e) => updateSlide(index, "description", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSlide}
            className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold"
          >
            + Add Slide
          </button>
        </div>
      ) : (
        // Page mode - Background Image & Overlay
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Background Image (Optional)
            </label>
            <MediaPicker
              type="image"
              multiple={false}
              value={section.background || null}
              onChange={(media) => updateField("background", media)}
            />
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col justify-center">
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Dark Overlay Opacity
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={section.overlay ?? 40}
              onChange={(e) => updateField("overlay", Number(e.target.value))}
              className="w-full accent-gray-900 cursor-pointer"
            />
            <div className="text-sm font-semibold text-gray-700 mt-2">
              {section.overlay ?? 40}% Dark Shading
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Adjusts how dark the gradient shading is over the background image.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroEditor;