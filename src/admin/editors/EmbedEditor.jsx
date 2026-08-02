import { useState, useEffect } from "react";

const EmbedEditor = ({
  section,
  onChange,
}) => {
  const [urlError, setUrlError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedType, setSelectedType] = useState(section.embedType || "iframe");

  // Update local state when prop changes
  useEffect(() => {
    setSelectedType(section.embedType || "iframe");
  }, [section.embedType]);

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

  // Validate URL based on embed type
  const validateUrl = (url, embedType) => {
    if (!url) {
      setUrlError("");
      return true;
    }

    try {
      new URL(url);
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }

    switch (embedType) {
      case "youtube":
        const youtubeRegex = /(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/))[a-zA-Z0-9_-]+/;
        if (!youtubeRegex.test(url)) {
          setUrlError("This doesn't look like a YouTube URL. Please paste a YouTube link.");
          return false;
        }
        break;
      case "google-map":
        if (!url.includes("google.com/maps") && !url.includes("google.com/maps/embed")) {
          setUrlError("Please enter a valid Google Maps embed URL.");
          return false;
        }
        break;
      case "google-calendar":
        if (!url.includes("calendar.google.com")) {
          setUrlError("Please enter a valid Google Calendar embed URL.");
          return false;
        }
        break;
      case "google-form":
        if (!url.includes("docs.google.com/forms")) {
          setUrlError("Please enter a valid Google Form embed URL.");
          return false;
        }
        break;
      default:
        break;
    }

    setUrlError("");
    return true;
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
    setSelectedType(newType);
    updateField("embedType", newType);
    updateField("url", ""); // Clear URL when switching types
    setUrlError("");
  };

  // Update preview URL when URL or embed type changes
  useEffect(() => {
    if (section.url && validateUrl(section.url, selectedType)) {
      setPreviewUrl(section.url);
    } else {
      setPreviewUrl("");
    }
  }, [section.url, selectedType]);

  // Get help text for each embed type
  const getHelpText = () => {
    const helpMap = {
      youtube: {
        label: "Paste YouTube video URL",
        instructions: "Paste the normal YouTube link (e.g., https://youtu.be/... or https://www.youtube.com/watch?v=...). It will be automatically converted to an embed URL.",
        example: "https://youtu.be/abc123"
      },
      "google-map": {
        label: "Paste Google Maps embed URL",
        instructions: "Google Maps → Share → Embed a map → Copy the src URL from the iframe code.",
        example: "https://www.google.com/maps/embed?pb=..."
      },
      "google-calendar": {
        label: "Paste Google Calendar embed URL",
        instructions: "Google Calendar → Settings → Calendars → Calendar details → Embed code → Copy the src URL.",
        example: "https://calendar.google.com/calendar/embed?src=..."
      },
      "google-form": {
        label: "Paste Google Form embed URL",
        instructions: "Google Forms → Send → <> Embed → Copy the URL from the iframe src attribute.",
        example: "https://docs.google.com/forms/d/e/..."
      },
      iframe: {
        label: "Paste embed URL",
        instructions: "Paste any embed URL that works with an iframe. Use the URL from the iframe's src attribute.",
        example: "https://..."
      }
    };
    return helpMap[selectedType] || helpMap.iframe;
  };

  // Get icon for dropdown
  const getEmbedIcon = (type) => {
    const icons = {
      youtube: "▶️",
      "google-map": "📍",
      "google-calendar": "📅",
      "google-form": "📝",
      iframe: "🌐"
    };
    return icons[type] || "🔗";
  };

  // Get display name for selected type
  const getTypeDisplayName = (type) => {
    const names = {
      youtube: "YouTube",
      "google-map": "Google Maps",
      "google-calendar": "Google Calendar",
      "google-form": "Google Form",
      iframe: "Website Embed"
    };
    return names[type] || "Website Embed";
  };

  const helpText = getHelpText();
  const currentType = selectedType || "iframe";

  return (
    <>
      {/* TITLE */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={section.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Campus Location"
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* EMBED TYPE */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Embed Type
        </label>
        <select
          value={currentType}
          onChange={handleTypeChange}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="youtube">▶️ YouTube</option>
          <option value="google-map">📍 Google Maps</option>
          <option value="google-form">📝 Google Forms</option>
          <option value="google-calendar">📅 Google Calendar</option>
          <option value="iframe">🌐 Website Embed</option>
        </select>
        
        {/* Show selected type name below dropdown */}
        <div className="mt-2 text-sm text-gray-600">
          Selected: <strong>{getTypeDisplayName(currentType)}</strong>
        </div>
      </div>

      {/* EMBED URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {helpText.label}
        </label>
        <input
          type="url"
          value={section.url || ""}
          onChange={handleUrlChange}
          placeholder={helpText.example}
          className={`w-full border rounded-xl px-4 py-3 ${
            urlError ? "border-red-500" : ""
          }`}
        />
        {urlError && (
          <p className="mt-2 text-sm text-red-600">
            ❌ {urlError}
          </p>
        )}
        
        {/* Instructions */}
        <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>How to get the URL:</strong>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {helpText.instructions}
          </p>
        </div>
      </div>

      {/* SIZE */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Height (px)
          </label>
          <input
            type="number"
            value={section.height || 500}
            onChange={(e) =>
              updateField("height", Number(e.target.value))
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Width
          </label>
          <input
            value={section.width || "100%"}
            onChange={(e) =>
              updateField("width", e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>
      </div>

      {/* OPTIONS */}
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <h3 className="font-medium">Allow Fullscreen</h3>
            <p className="text-sm text-gray-500">
              Allow the embedded content to enter fullscreen mode.
            </p>
          </div>
          <input
            type="checkbox"
            checked={section.allowFullscreen ?? true}
            onChange={(e) =>
              updateField("allowFullscreen", e.target.checked)
            }
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <h3 className="font-medium">Lazy Loading</h3>
            <p className="text-sm text-gray-500">
              Load the embed only when it becomes visible.
            </p>
          </div>
          <input
            type="checkbox"
            checked={section.lazyLoad ?? true}
            onChange={(e) =>
              updateField("lazyLoad", e.target.checked)
            }
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <h3 className="font-medium">Responsive</h3>
            <p className="text-sm text-gray-500">
              Automatically fit the container width.
            </p>
          </div>
          <input
            type="checkbox"
            checked={section.responsive ?? true}
            onChange={(e) =>
              updateField("responsive", e.target.checked)
            }
            className="h-5 w-5"
          />
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-3">
          Live Preview
        </label>
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
              <p className="font-semibold">
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
      </div>

      {/* HELP */}
      <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-semibold mb-3">
          Supported Embeds
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>YouTube Videos</li>
          <li>Google Maps</li>
          <li>Google Forms</li>
          <li>Google Calendar</li>
          <li>Vimeo</li>
          <li>Generic iframe URLs</li>
        </ul>
      </div>
    </>
  );
};

export default EmbedEditor;