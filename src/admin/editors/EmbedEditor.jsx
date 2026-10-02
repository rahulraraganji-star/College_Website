import { useState } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const EmbedEditor = ({
  section,
  onChange,
}) => {
  const [urlError, setUrlError] = useState("");
  const selectedType = section.embedType || "iframe";

  // Auto-convert YouTube URLs
  const convertYouTubeUrl = (url) => {
    if (!url) return url;
    
    // Handle youtu.be format
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuBeMatch) {
      return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
    }
    
    // Handle youtube.com/watch?v= format
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    // Handle youtube.com/embed/ format (already correct)
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      return url;
    }
    
    return url;
  };

  // Helper to extract clean domain name from URL
  const getDomainFromUrl = (url) => {
    if (!url) return "";
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url.split("/")[0] || "";
    }
  };

  // Pure validator without side-effects
  const checkUrlValidity = (url, embedType) => {
    if (!url) return { valid: true, error: "" };
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return { valid: false, error: "Please enter a valid URL (e.g. https://example.com)" };
    }

    switch (embedType) {
      case "youtube": {
        const youtubeRegex = /(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/))[a-zA-Z0-9_-]+/;
        if (!youtubeRegex.test(url)) {
          return { valid: false, error: "This doesn't look like a YouTube URL. Please paste a YouTube link." };
        }
        break;
      }
      case "google-map":
        if (!url.includes("google.com/maps") && !url.includes("google.com/maps/embed")) {
          return { valid: false, error: "Please enter a valid Google Maps embed URL." };
        }
        break;
      case "google-calendar":
        if (!url.includes("calendar.google.com")) {
          return { valid: false, error: "Please enter a valid Google Calendar embed URL." };
        }
        break;
      case "google-form":
        if (!url.includes("docs.google.com/forms")) {
          return { valid: false, error: "Please enter a valid Google Form embed URL." };
        }
        break;
      case "link":
      case "iframe":
      default:
        break;
    }

    return { valid: true, error: "" };
  };

  // Validate URL based on embed type with UI state update
  const validateUrl = (url, embedType) => {
    const { valid, error } = checkUrlValidity(url, embedType);
    setUrlError(error);
    return valid;
  };

  const updateField = (field, value) => {
    const updatedSection = {
      ...section,
      [field]: value,
    };
    onChange(updatedSection);
  };

  const handleUrlChange = (e) => {
    let url = e.target.value;
    
    // Auto-convert YouTube URLs
    if (selectedType === "youtube" && url) {
      url = convertYouTubeUrl(url);
    }
    
    updateField("url", url);
    validateUrl(url, selectedType);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    updateField("embedType", newType);
    setUrlError("");
  };

  const previewUrl = section.url && checkUrlValidity(section.url, selectedType).valid ? section.url : "";

  // Links array helpers
  const linksList = Array.isArray(section.links) ? section.links : [];

  const handleAddLink = () => {
    const newLink = {
      id: `link_${Date.now()}`,
      title: "",
      url: "",
      description: "",
      buttonText: "Open Link",
      openInNewTab: true,
    };
    updateField("links", [...linksList, newLink]);
  };

  const handleUpdateLink = (index, key, value) => {
    const updated = [...linksList];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    updateField("links", updated);
  };

  const handleRemoveLink = (index) => {
    const updated = linksList.filter((_, i) => i !== index);
    updateField("links", updated);
  };

  const handleMoveLink = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= linksList.length) return;
    const updated = [...linksList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateField("links", updated);
  };

  // Get help text for each embed type
  const getHelpText = () => {
    const helpMap = {
      link: {
        label: "Primary Link URL",
        instructions: "Paste any external web page, official portal, circular, or document URL. It will be rendered as a responsive, clickable card.",
        example: "https://aktu.ac.in or https://portal.example.edu",
      },
      youtube: {
        label: "Paste YouTube video URL",
        instructions: "Paste the normal YouTube link (e.g., https://youtu.be/... or https://www.youtube.com/watch?v=...). It will be automatically converted to an embed URL.",
        example: "https://youtu.be/abc123",
      },
      "google-map": {
        label: "Paste Google Maps embed URL",
        instructions: "Google Maps → Share → Embed a map → Copy the src URL from the iframe code.",
        example: "https://www.google.com/maps/embed?pb=...",
      },
      "google-calendar": {
        label: "Paste Google Calendar embed URL",
        instructions: "Google Calendar → Settings → Calendars → Calendar details → Embed code → Copy the src URL.",
        example: "https://calendar.google.com/calendar/embed?src=...",
      },
      "google-form": {
        label: "Paste Google Form embed URL",
        instructions: "Google Forms → Send → <> Embed → Copy the URL from the iframe src attribute.",
        example: "https://docs.google.com/forms/d/e/...",
      },
      iframe: {
        label: "Paste embed URL",
        instructions: "Paste any embed URL that works with an iframe. Use the URL from the iframe's src attribute.",
        example: "https://...",
      },
    };
    return helpMap[selectedType] || helpMap.iframe;
  };

  // Get icon for dropdown
  const getEmbedIcon = (type) => {
    const icons = {
      link: "🔗",
      youtube: "▶️",
      "google-map": "📍",
      "google-calendar": "📅",
      "google-form": "📝",
      iframe: "🌐",
    };
    return icons[type] || "🔗";
  };

  // Get display name for selected type
  const getTypeDisplayName = (type) => {
    const names = {
      link: "Direct Link / Web Resource",
      youtube: "YouTube Video",
      "google-map": "Google Maps",
      "google-calendar": "Google Calendar",
      "google-form": "Google Form",
      iframe: "Website Embed (iframe)",
    };
    return names[type] || "Website Embed";
  };

  const helpText = getHelpText();
  const currentType = selectedType || "iframe";
  const isLinkType = currentType === "link";

  return (
    <>
      {/* SECTION TITLE */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Section Title
        </label>
        <input
          type="text"
          value={section.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={isLinkType ? "e.g., Official Portals & Useful Links" : "e.g., Campus Location"}
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
        />
      </div>

      {/* EMBED TYPE SELECTOR */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Embed Type
        </label>
        <select
          value={currentType}
          onChange={handleTypeChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all cursor-pointer font-medium"
        >
          <option value="link">🔗 Direct Link / Web Resource (Recommended for Links)</option>
          <option value="youtube">▶️ YouTube Video</option>
          <option value="google-map">📍 Google Maps</option>
          <option value="google-form">📝 Google Forms</option>
          <option value="google-calendar">📅 Google Calendar</option>
          <option value="iframe">🌐 Website Embed (iframe)</option>
        </select>
        
        {/* Selected type badge */}
        <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium">
            <span>{getEmbedIcon(currentType)}</span>
            <span>{getTypeDisplayName(currentType)}</span>
          </span>
          {isLinkType ? (
            <span className="text-gray-500">Opens external web pages reliably without iframe restrictions.</span>
          ) : (
            <span className="text-gray-500">Renders within an embedded interactive window.</span>
          )}
        </div>
      </div>

      {/* PRIMARY URL & FIELDS */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          {helpText.label}
        </label>
        <div className="relative">
          <input
            type="url"
            value={section.url || ""}
            onChange={handleUrlChange}
            placeholder={helpText.example}
            className={`w-full border rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all ${
              urlError ? "border-red-500 bg-red-50/30" : ""
            }`}
          />
          {section.url && (
            <a
              href={section.url.startsWith("http") ? section.url : `https://${section.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 p-1"
              title="Test open link"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        {urlError && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5">
            <span>❌</span>
            <span>{urlError}</span>
          </p>
        )}
        
        {/* Instructions */}
        <div className="mt-3 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-blue-950">
              <strong className="font-semibold text-blue-900 block mb-0.5">Instructions:</strong>
              {helpText.instructions}
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED LINK FIELDS (When Embed Type is 'link') */}
      {isLinkType && (
        <div className="mb-6 p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <LinkIcon size={16} className="text-amber-700" />
            <h3 className="text-sm font-semibold text-gray-900">Link Card Details</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Link Title / Heading
              </label>
              <input
                type="text"
                value={section.linkText || ""}
                onChange={(e) => updateField("linkText", e.target.value)}
                placeholder="e.g., University Examination Portal"
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                value={section.buttonText || "Open Link"}
                onChange={(e) => updateField("buttonText", e.target.value)}
                placeholder="e.g., Visit Portal, Download, Open"
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description / Summary (Optional)
            </label>
            <textarea
              rows={2}
              value={section.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of what this link provides..."
              className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-medium text-gray-800">Open in New Tab</span>
              <p className="text-[11px] text-gray-500">Recommended for external portals and resources</p>
            </div>
            <input
              type="checkbox"
              checked={section.openInNewTab ?? true}
              onChange={(e) => updateField("openInNewTab", e.target.checked)}
              className="h-4 w-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* MULTIPLE LINKS / ATTACHED LINKS MANAGER */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <LinkIcon size={16} className="text-amber-600" />
              <span>{isLinkType ? "Additional Links in this Section" : "Attached Resource Links & Buttons"}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLinkType
                ? "Add more links if you want to display a list or grid of related links."
                : "Optionally add direct links or action buttons below your embed (e.g., Open in Google Maps, Download PDF)."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Link</span>
          </button>
        </div>

        {/* List of additional links */}
        {linksList.length > 0 ? (
          <div className="space-y-3 mt-4">
            {linksList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {item.title || "Untitled Link"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveLink(idx, -1)}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === linksList.length - 1}
                      onClick={() => handleMoveLink(idx, 1)}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer ml-1"
                      title="Remove link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Link Title / Label
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => handleUpdateLink(idx, "title", e.target.value)}
                      placeholder="e.g., Admission Form Portal"
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Target URL
                    </label>
                    <input
                      type="url"
                      value={item.url || ""}
                      onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) => handleUpdateLink(idx, "description", e.target.value)}
                      placeholder="Short note or helper info..."
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={item.buttonText || "Open Link"}
                      onChange={(e) => handleUpdateLink(idx, "buttonText", e.target.value)}
                      placeholder="Open Link"
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-center py-4 border border-dashed border-gray-300 rounded-xl bg-white/50 text-xs text-gray-500">
            No additional links added yet. Click &quot;Add Link&quot; to add links to this section.
          </div>
        )}
      </div>

      {/* IFRAME SPECIFIC SIZING & OPTIONS (Only shown when not pure link embed) */}
      {!isLinkType && (
        <>
          {/* SIZE */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">
                Height (px)
              </label>
              <input
                type="number"
                value={section.height || 500}
                onChange={(e) => updateField("height", Number(e.target.value))}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-800">
                Width
              </label>
              <input
                value={section.width || "100%"}
                onChange={(e) => updateField("width", e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          {/* OPTIONS */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border rounded-xl p-4 bg-white">
              <div>
                <h3 className="font-medium text-sm text-gray-900">Allow Fullscreen</h3>
                <p className="text-xs text-gray-500">
                  Allow the embedded content to enter fullscreen mode.
                </p>
              </div>
              <input
                type="checkbox"
                checked={section.allowFullscreen ?? true}
                onChange={(e) => updateField("allowFullscreen", e.target.checked)}
                className="h-5 w-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border rounded-xl p-4 bg-white">
              <div>
                <h3 className="font-medium text-sm text-gray-900">Lazy Loading</h3>
                <p className="text-xs text-gray-500">
                  Load the embed only when it becomes visible.
                </p>
              </div>
              <input
                type="checkbox"
                checked={section.lazyLoad ?? true}
                onChange={(e) => updateField("lazyLoad", e.target.checked)}
                className="h-5 w-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border rounded-xl p-4 bg-white">
              <div>
                <h3 className="font-medium text-sm text-gray-900">Responsive</h3>
                <p className="text-xs text-gray-500">
                  Automatically fit the container width.
                </p>
              </div>
              <input
                type="checkbox"
                checked={section.responsive ?? true}
                onChange={(e) => updateField("responsive", e.target.checked)}
                className="h-5 w-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </>
      )}

      {/* LIVE PREVIEW */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-3 text-gray-800 flex items-center justify-between">
          <span>Live Preview</span>
          <span className="text-xs font-normal text-gray-500">What visitors will see</span>
        </label>

        {isLinkType ? (
          /* LINK EMBED PREVIEW */
          <div className="border-2 rounded-2xl p-6 bg-gradient-to-br from-[#FAF8F5] to-white border-[#E6DED3] space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A555]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A6B3F]">
                External Resource
              </span>
            </div>

            {/* Primary link card */}
            {section.url ? (
              <div className="p-5 rounded-xl border border-[#E6DED3] bg-white shadow-xs hover:border-[#C9A555] transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F4EDE2] text-[#8A6B3F] border border-[#E6DED3]">
                        {getDomainFromUrl(section.url)}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-[#2A2623] truncate">
                      {section.linkText || section.title || "External Resource Link"}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-[#7A7268] line-clamp-2">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A2623] text-white text-xs font-medium group-hover:bg-[#8A6B3F] transition-colors shadow-xs">
                      <span>{section.buttonText || "Open Link"}</span>
                      <ExternalLink size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                Enter a target link URL above to see the interactive link card preview.
              </div>
            )}

            {/* Additional links preview */}
            {linksList.length > 0 && (
              <div className="pt-3 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Additional Resources ({linksList.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {linksList.map((lnk, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-amber-400 transition-all flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {lnk.title || `Resource ${idx + 1}`}
                        </p>
                        {lnk.url && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {getDomainFromUrl(lnk.url)}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 shrink-0">
                        <span>{lnk.buttonText || "Open"}</span>
                        <ExternalLink size={11} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* IFRAME PREVIEW */
          <div className="space-y-4">
            <div className="border-2 rounded-2xl overflow-hidden bg-gray-50">
              {previewUrl && !urlError ? (
                <iframe
                  src={previewUrl}
                  title="Embed Preview"
                  className="w-full"
                  style={{
                    height: Math.min(section.height || 500, 400),
                    border: "none",
                  }}
                  allowFullScreen={section.allowFullscreen ?? true}
                  loading={section.lazyLoad ? "lazy" : "eager"}
                />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6">
                  <div className="text-5xl mb-4">
                    {getEmbedIcon(currentType)}
                  </div>
                  <p className="font-semibold text-gray-800">
                    {section.url ? "Invalid or unsupported URL" : "Ready for your embed"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    {section.url
                      ? "Please check the URL and ensure it's valid."
                      : `Paste a valid ${getTypeDisplayName(currentType)} URL above to see the live preview.`}
                  </p>
                </div>
              )}
            </div>

            {/* Attached links preview below iframe */}
            {linksList.length > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-wrap gap-2.5 items-center">
                <span className="text-xs font-semibold text-gray-600">Attached Links:</span>
                {linksList.map((lnk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-800 shadow-2xs"
                  >
                    <span>{lnk.title || `Resource ${idx + 1}`}</span>
                    <ExternalLink size={12} className="text-amber-600" />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* HELP INFO */}
      <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
        <h3 className="font-semibold mb-3 text-sm text-blue-950">
          Supported Embed & Link Types
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-xs text-gray-700">
          <li className="flex items-center gap-2">
            <span>🔗</span>
            <span><strong>Direct Web Links</strong> & Resource Portals</span>
          </li>
          <li className="flex items-center gap-2">
            <span>▶️</span>
            <span><strong>YouTube Videos</strong> (auto-converted)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📍</span>
            <span><strong>Google Maps</strong> Embeds</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📝</span>
            <span><strong>Google Forms</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <span>📅</span>
            <span><strong>Google Calendars</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <span>🌐</span>
            <span><strong>Website Embeds</strong> (iframes)</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default EmbedEditor;