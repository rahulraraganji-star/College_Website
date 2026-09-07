import React, { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Building,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Share2,
  Map,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

const API_URL = "/api";
const CURRENT_YEAR = new Date().getFullYear();

const SOCIAL_ICON_OPTIONS = [
  { value: "FaFacebookF", label: "Facebook", Icon: FaFacebookF },
  { value: "FaInstagram", label: "Instagram", Icon: FaInstagram },
  { value: "FaXTwitter", label: "X / Twitter", Icon: FaXTwitter },
  { value: "FaWhatsapp", label: "WhatsApp", Icon: FaWhatsapp },
];

const iconMap = {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
};

const FooterManager = () => {
  const { user, hasPermission } = useAuth();
  const canEdit =
    hasPermission("settings.edit") ||
    user?.role === "super_admin" ||
    user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brand: "",
    tagline: "",
    description: "",
    addressLines: [],
    phone: "",
    email: "",
    quickLinks: [],
    supportLinks: [],
    socials: [],
    mapEmbedUrl: "",
  });

  const [initialData, setInitialData] = useState({
    brand: "",
    tagline: "",
    description: "",
    addressLines: [],
    phone: "",
    email: "",
    quickLinks: [],
    supportLinks: [],
    socials: [],
    mapEmbedUrl: "",
  });

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

  // Fetch Footer Settings
  const fetchFooterSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/settings/footer`);
      if (!res.ok) throw new Error("Failed to load footer settings");
      const data = await res.json();

      const loaded = {
        brand: data?.brand || "",
        tagline: data?.tagline || "",
        description: data?.description || "",
        addressLines: Array.isArray(data?.addressLines) ? data.addressLines : [],
        phone: data?.phone || "",
        email: data?.email || "",
        quickLinks: Array.isArray(data?.quickLinks) ? data.quickLinks : [],
        supportLinks: Array.isArray(data?.supportLinks) ? data.supportLinks : [],
        socials: Array.isArray(data?.socials) ? data.socials : [],
        mapEmbedUrl: data?.mapEmbedUrl || "",
      };

      setFormData(loaded);
      setInitialData(loaded);
    } catch (err) {
      console.error("Error loading footer settings:", err);
      showToast("error", err.message || "Failed to load footer settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Address Lines Handlers
  const handleAddAddressLine = () => {
    setFormData((prev) => ({
      ...prev,
      addressLines: [...prev.addressLines, ""],
    }));
  };

  const handleUpdateAddressLine = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.addressLines];
      updated[index] = value;
      return { ...prev, addressLines: updated };
    });
  };

  const handleRemoveAddressLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      addressLines: prev.addressLines.filter((_, i) => i !== index),
    }));
  };

  // Generic Links Handlers (Quick Links / Support Links)
  const handleAddLink = (listKey) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], { name: "", url: "" }],
    }));
  };

  const handleUpdateLink = (listKey, index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev[listKey]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [listKey]: updated };
    });
  };

  const handleRemoveLink = (listKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  const handleMoveLink = (listKey, index, direction) => {
    setFormData((prev) => {
      const items = [...prev[listKey]];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, [listKey]: items };
    });
  };

  // Social Links Handlers
  const handleAddSocial = () => {
    setFormData((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        { name: "Social Link", icon: "FaFacebookF", url: "https://" },
      ],
    }));
  };

  const handleUpdateSocial = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.socials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socials: updated };
    });
  };

  const handleRemoveSocial = (index) => {
    setFormData((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  };

  // Reset
  const handleReset = () => {
    setFormData(initialData);
    showToast("info", "Changes reset to last saved state");
  };

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData);

  // Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!canEdit) {
      showToast("error", "You do not have permission to edit footer settings");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/settings/footer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to save footer settings");
      }

      setInitialData(formData);
      showToast("success", "Footer settings saved successfully!");
    } catch (err) {
      console.error("Error saving footer settings:", err);
      showToast("error", err.message || "Failed to save footer settings");
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
      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold text-black tracking-tight">
              Footer Management
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-neutral-100 text-neutral-900 border border-neutral-300">
              Settings
            </span>
          </div>
          <p className="text-neutral-500 mt-1.5 text-[14.5px]">
            Manage footer branding, contact details, quick links, support links, social profiles, and Google Map.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
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
                <span>Save Footer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 text-sm">
          Loading footer settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. BRAND & DESCRIPTION */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Building size={16} className="text-black" />
                <h2 className="text-sm font-bold text-black">
                  Brand Identity & Description
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Footer Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleFieldChange("brand", e.target.value)}
                    placeholder="e.g. Fr. Agnel College"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Footer Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleFieldChange("tagline", e.target.value)}
                    placeholder="e.g. Inspiring Excellence"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  About / Footer Summary Text
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Enter a brief summary of the college that appears in the footer..."
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition resize-y"
                  disabled={!canEdit}
                />
              </div>
            </div>

            {/* 2. CONTACT INFORMATION & ADDRESS */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <MapPin size={16} className="text-black" />
                <h2 className="text-sm font-bold text-black">
                  Contact Information & Address Lines
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Phone size={12} /> Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="e.g. +91 832 2218544"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Mail size={12} /> Official Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="e.g. office@fragnelcollege.edu.in"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {/* Address Lines List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Address Lines (Stacked)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAddressLine}
                    className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                    disabled={!canEdit}
                  >
                    <Plus size={13} /> Add Line
                  </button>
                </div>

                {formData.addressLines.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    No address lines added. Click "Add Line" above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.addressLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => handleUpdateAddressLine(idx, e.target.value)}
                          placeholder={`Address Line ${idx + 1}`}
                          className="flex-1 px-3.5 py-2 text-sm bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                          disabled={!canEdit}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAddressLine(idx)}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition"
                          title="Remove Line"
                          disabled={!canEdit}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. QUICK LINKS & SUPPORT LINKS */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <LinkIcon size={16} className="text-black" />
                <h2 className="text-sm font-bold text-black">
                  Navigation Columns (Quick Links & Support)
                </h2>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                      Column 1: Quick Links
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      General college links (e.g. About, Academics, Admissions).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink("quickLinks")}
                    className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                    disabled={!canEdit}
                  >
                    <Plus size={13} /> Add Quick Link
                  </button>
                </div>

                {formData.quickLinks.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    No quick links configured. Click "Add Quick Link".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.quickLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-3"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLink("quickLinks", idx, "up")}
                            disabled={idx === 0 || !canEdit}
                            className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink("quickLinks", idx, "down")}
                            disabled={idx === formData.quickLinks.length - 1 || !canEdit}
                            className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) =>
                            handleUpdateLink("quickLinks", idx, "name", e.target.value)
                          }
                          placeholder="Link Label"
                          className="flex-1 px-3 py-1.5 text-xs bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                          disabled={!canEdit}
                        />

                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink("quickLinks", idx, "url", e.target.value)
                          }
                          placeholder="/page-slug or https://"
                          className="flex-1 px-3 py-1.5 text-xs font-mono bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                          disabled={!canEdit}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveLink("quickLinks", idx)}
                          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200/50 rounded-lg transition"
                          disabled={!canEdit}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Links */}
              <div className="border-t border-neutral-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                      Column 2: Support & Compliance Links
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Compliance and support links (e.g. RTI, Grievance, IQAC).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink("supportLinks")}
                    className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                    disabled={!canEdit}
                  >
                    <Plus size={13} /> Add Support Link
                  </button>
                </div>

                {formData.supportLinks.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    No support links configured. Click "Add Support Link".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.supportLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-3"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLink("supportLinks", idx, "up")}
                            disabled={idx === 0 || !canEdit}
                            className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink("supportLinks", idx, "down")}
                            disabled={idx === formData.supportLinks.length - 1 || !canEdit}
                            className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-20"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) =>
                            handleUpdateLink("supportLinks", idx, "name", e.target.value)
                          }
                          placeholder="Link Label"
                          className="flex-1 px-3 py-1.5 text-xs bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                          disabled={!canEdit}
                        />

                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink("supportLinks", idx, "url", e.target.value)
                          }
                          placeholder="/page-slug or https://"
                          className="flex-1 px-3 py-1.5 text-xs font-mono bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                          disabled={!canEdit}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveLink("supportLinks", idx)}
                          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200/50 rounded-lg transition"
                          disabled={!canEdit}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. SOCIAL PROFILES & MAP */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Share2 size={16} className="text-black" />
                <h2 className="text-sm font-bold text-black">
                  Social Links & Google Map Embed
                </h2>
              </div>

              {/* Socials */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Social Media Profiles
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                    disabled={!canEdit}
                  >
                    <Plus size={13} /> Add Social Link
                  </button>
                </div>

                {formData.socials.length === 0 ? (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    No social media links added.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.socials.map((social, idx) => {
                      const SelectedIcon = iconMap[social.icon] || FaFacebookF;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0 text-sm">
                            <SelectedIcon />
                          </div>

                          <select
                            value={social.icon}
                            onChange={(e) =>
                              handleUpdateSocial(idx, "icon", e.target.value)
                            }
                            className="px-2.5 py-1.5 text-xs bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                            disabled={!canEdit}
                          >
                            {SOCIAL_ICON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) =>
                              handleUpdateSocial(idx, "url", e.target.value)
                            }
                            placeholder="https://..."
                            className="flex-1 px-3 py-1.5 text-xs font-mono bg-white text-black border border-neutral-300 rounded-lg focus:border-black outline-none"
                            disabled={!canEdit}
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(idx)}
                            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200/50 rounded-lg transition"
                            disabled={!canEdit}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Map Embed URL */}
              <div className="border-t border-neutral-100 pt-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <Map size={13} /> Google Maps Embed URL
                </label>
                <input
                  type="text"
                  value={formData.mapEmbedUrl}
                  onChange={(e) => handleFieldChange("mapEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-neutral-50 text-black border border-neutral-300 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                  disabled={!canEdit}
                />
                <p className="text-[11px] text-neutral-500">
                  Embed URL from Google Maps (Share → Embed a map → copy the iframe src URL).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Footer Dark-Theme Preview */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-black" />
                  <h3 className="text-sm font-bold text-black">
                    Live Footer Preview
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-black text-white font-mono">
                  Dark Theme
                </span>
              </div>

              {/* Public Footer Replica */}
              <div className="rounded-xl overflow-hidden bg-black text-neutral-200 p-5 text-xs space-y-5 border border-neutral-800 shadow-inner">
                {/* Brand & Description */}
                <div>
                  <div className="text-base font-semibold text-white">
                    {formData.brand || "College Brand"}
                  </div>
                  {formData.tagline && (
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {formData.tagline}
                    </div>
                  )}
                  {formData.description && (
                    <p className="mt-2.5 text-[11px] text-neutral-300 line-clamp-3 leading-relaxed">
                      {formData.description}
                    </p>
                  )}
                </div>

                {/* Contact & Address */}
                <div className="text-[11px] space-y-1 text-neutral-300 border-t border-neutral-900 pt-3">
                  {formData.addressLines.map((line, i) => (
                    <div key={i} className="text-neutral-400">
                      {line}
                    </div>
                  ))}
                  <div className="mt-2 flex flex-wrap gap-3 text-white font-medium">
                    {formData.phone && <span>Tel: {formData.phone}</span>}
                    {formData.email && <span>Email: {formData.email}</span>}
                  </div>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-neutral-900 pt-3 text-[11px]">
                  <div>
                    <div className="text-white font-semibold mb-2">Quick Links</div>
                    <ul className="space-y-1 text-neutral-400">
                      {formData.quickLinks.slice(0, 4).map((link, i) => (
                        <li key={i} className="hover:text-white truncate">
                          • {link.name || "Link"}
                        </li>
                      ))}
                      {formData.quickLinks.length > 4 && (
                        <li className="text-[10px] text-neutral-500">
                          +{formData.quickLinks.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="text-white font-semibold mb-2">Support</div>
                    <ul className="space-y-1 text-neutral-400">
                      {formData.supportLinks.slice(0, 4).map((link, i) => (
                        <li key={i} className="hover:text-white truncate">
                          • {link.name || "Link"}
                        </li>
                      ))}
                      {formData.supportLinks.length > 4 && (
                        <li className="text-[10px] text-neutral-500">
                          +{formData.supportLinks.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Map & Socials */}
                <div className="border-t border-neutral-900 pt-3 space-y-3">
                  {formData.mapEmbedUrl ? (
                    <div className="w-full h-28 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                      <iframe
                        src={formData.mapEmbedUrl}
                        className="w-full h-full border-0 pointer-events-none opacity-80"
                        title="Map Preview"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-16 rounded-lg border border-dashed border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">
                      No Google Map URL provided
                    </div>
                  )}

                  {/* Social Icons */}
                  <div className="flex items-center gap-2 pt-1">
                    {formData.socials.map((s, i) => {
                      const IconComponent = iconMap[s.icon] || FaFacebookF;
                      return (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center text-xs transition"
                          title={s.name}
                        >
                          <IconComponent />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-neutral-900 pt-3 text-[10px] text-neutral-500">
                  © {CURRENT_YEAR} {formData.brand || "Fr. Agnel College"}. All rights reserved.
                </div>
              </div>

              <p className="text-xs text-neutral-400 text-center">
                Updates dynamically to mirror public website appearance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManager;
