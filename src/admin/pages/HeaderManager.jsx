import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Save,
  RotateCcw,
  Layout,
  Menu as MenuIcon,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MediaPicker from "../media/components/MediaPicker";
import Toast from "../components/Toast";
import NavigationManager from "./NavigationManager";
import defaultLogoSvg from "../../assets/logo.svg";

const API_URL = "/api";

const HeaderManager = () => {
  const { user, hasPermission } = useAuth();
  const canEdit =
    hasPermission("settings.edit") ||
    user?.role === "super_admin" ||
    user?.role === "admin";

  const [activeTab, setActiveTab] = useState("branding"); // "branding" | "navigation"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    logo: "",
    title: "",
    subtitle: "",
    tagline: "",
  });

  const [initialData, setInitialData] = useState({
    logo: "",
    title: "",
    subtitle: "",
    tagline: "",
  });

  const [previewMode, setPreviewMode] = useState("desktop"); // "desktop" | "mobile"

  // Toast
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  // Fetch Header Settings
  const fetchHeaderSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/settings/header`);
      if (!res.ok) throw new Error("Failed to load header settings");
      const data = await res.json();

      const loaded = {
        logo: data?.logo || "",
        title: data?.title || "",
        subtitle: data?.subtitle || "",
        tagline: data?.tagline || "",
      };

      setFormData(loaded);
      setInitialData(loaded);
    } catch (err) {
      console.error("Error loading header settings:", err);
      showToast("error", err.message || "Failed to load header data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoSelect = (media) => {
    if (!media) {
      setFormData((prev) => ({ ...prev, logo: "" }));
      return;
    }
    const url = typeof media === "string" ? media : media.url || "";
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleReset = () => {
    setFormData(initialData);
    showToast("info", "Changes reset to last saved state");
  };

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!canEdit) {
      showToast("error", "You do not have permission to edit header settings");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/settings/header`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to save header settings");
      }

      setInitialData(formData);
      showToast("success", "Header branding updated successfully!");
    } catch (err) {
      console.error("Error saving header settings:", err);
      showToast("error", err.message || "Failed to save header settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-8 max-w-7xl mx-auto space-y-8 antialiased text-black"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Toast Notification */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold text-black tracking-tight">
              Header Management
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-neutral-100 text-neutral-900 border border-neutral-300">
              Settings
            </span>
          </div>
          <p className="text-neutral-500 mt-1.5 text-[14.5px]">
            Manage website branding, college title, tagline, logo, and top navigation.
          </p>
        </div>

        {/* Black and White Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-300 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "branding"
                ? "bg-black text-white shadow-sm"
                : "text-neutral-600 hover:text-black hover:bg-neutral-200/70"
              }`}
          >
            <Layout size={14} />
            <span>Header and logo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("navigation")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "navigation"
                ? "bg-black text-white shadow-sm"
                : "text-neutral-600 hover:text-black hover:bg-neutral-200/70"
              }`}
          >
            <MenuIcon size={14} />
            <span>Navigation & Menus</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: BRANDING & IDENTITY */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 text-sm">
              Loading header settings...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-sm font-bold text-black flex items-center gap-2">
                      <Sparkles size={16} className="text-black" />
                      Header Identity & Content
                    </h2>
                    {hasUnsavedChanges && (
                      <span className="text-[11px] font-semibold text-black bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-300">
                        Unsaved Changes
                      </span>
                    )}
                  </div>

                  {/* College Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      College Name / Main Title <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g. Fr. Agnel College of Arts & Commerce"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                      disabled={!canEdit}
                    />
                    <p className="text-[11px] text-neutral-500">
                      Displayed prominently in the main header across all public pages.
                    </p>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Subtitle / Location
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      placeholder="e.g. Pilar, Goa - 403 203"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                      disabled={!canEdit}
                    />
                    <p className="text-[11px] text-neutral-500">
                      Displayed below the college title.
                    </p>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Tagline / Accreditation Note
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => handleInputChange("tagline", e.target.value)}
                      placeholder="e.g. Affiliated to Goa University | Accredited by NAAC"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                      disabled={!canEdit}
                    />
                    <p className="text-[11px] text-neutral-500">
                      Appears in subtle uppercase lettering below the subtitle.
                    </p>
                  </div>

                  {/* Logo Selector */}
                  <div className="border-t border-neutral-100 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Header Logo
                      </label>
                      {formData.logo && (
                        <button
                          type="button"
                          onClick={() => handleLogoSelect(null)}
                          className="text-xs text-neutral-600 hover:text-black underline font-medium"
                        >
                          Revert to Default Logo
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-300 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border border-neutral-300 bg-white p-2 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                        <img
                          src={formData.logo || defaultLogoSvg}
                          alt="Current Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black truncate">
                          {formData.logo ? "Custom Uploaded Logo" : "Default College Logo (SVG)"}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                          {formData.logo || "src/assets/logo.svg"}
                        </p>
                      </div>
                    </div>

                    {/* MediaPicker integration */}
                    <MediaPicker
                      label="Select or Change Logo from Media Library"
                      type="image"
                      multiple={false}
                      onChange={handleLogoSelect}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-neutral-100 pt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={!hasUnsavedChanges || saving}
                      className="px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-300 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !canEdit}
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save Header</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Header Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-black" />
                      <h3 className="text-sm font-bold text-black">
                        Live Header Preview
                      </h3>
                    </div>

                    {/* Desktop / Mobile toggle in Black & White */}
                    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-300 text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("desktop")}
                        className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${previewMode === "desktop"
                            ? "bg-black text-white"
                            : "text-neutral-600 hover:text-black"
                          }`}
                      >
                        <Monitor size={12} />
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("mobile")}
                        className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium transition ${previewMode === "mobile"
                            ? "bg-black text-white"
                            : "text-neutral-600 hover:text-black"
                          }`}
                      >
                        <Smartphone size={12} />
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas */}
                  <div className="rounded-xl border border-neutral-300 bg-[#FAF8F5] overflow-hidden p-4">
                    {previewMode === "desktop" ? (
                      /* DESKTOP PREVIEW */
                      <div className="py-6 px-4 text-center">
                        <div className="flex items-center justify-center gap-5">
                          <img
                            src={formData.logo || defaultLogoSvg}
                            alt="College Logo"
                            className="w-16 md:w-20 h-auto object-contain"
                          />
                          <div className="text-center">
                            <h1
                              className="text-[#233044] text-xl md:text-3xl leading-tight tracking-wide font-normal"
                              style={{ fontFamily: "'Jaini Purva', cursive, serif" }}
                            >
                              {formData.title || "College Name"}
                            </h1>
                            {formData.subtitle && (
                              <p className="mt-1.5 text-[#9A7B4F] text-xs md:text-sm tracking-[0.08em] font-medium">
                                {formData.subtitle}
                              </p>
                            )}
                            {formData.tagline && (
                              <p className="mt-1 text-[#6B7280] text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-normal">
                                {formData.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* MOBILE PREVIEW */
                      <div className="max-w-sm mx-auto py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={formData.logo || defaultLogoSvg}
                            alt="College Logo"
                            className="h-14 w-14 rounded-full border-2 border-[#C8921B] bg-white p-2 object-contain flex-shrink-0"
                          />
                          <div className="flex-1 text-left">
                            <h1
                              className="text-[#233044] text-lg leading-tight font-normal"
                              style={{ fontFamily: "'Jaini Purva', cursive, serif" }}
                            >
                              {formData.title || "College Name"}
                            </h1>
                            {formData.subtitle && (
                              <p className="mt-1 text-[#C8921B] text-xs font-semibold tracking-[0.05em]">
                                {formData.subtitle}
                              </p>
                            )}
                            {formData.tagline && (
                              <p className="mt-0.5 text-[#7C8493] text-[9px] uppercase tracking-[0.05em]">
                                {formData.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 text-center">
                    Simulating the public website's header layout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: NAVIGATION & MENUS */}
      {activeTab === "navigation" && (
        <div className="space-y-4">
          <div className="bg-neutral-100 border border-neutral-300 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-black mt-0.5 flex-shrink-0" />
            <div className="text-xs text-neutral-800 leading-relaxed">
              <strong>Integrated Navigation Manager:</strong> Menus, dropdowns, and links configured below feed directly into the top navbar on the public website.
            </div>
          </div>

          {/* Reusing existing NavigationManager directly */}
          <NavigationManager />
        </div>
      )}
    </div>
  );
};

export default HeaderManager;
