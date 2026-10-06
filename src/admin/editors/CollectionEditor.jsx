import MediaPicker from "../media/components/MediaPicker";
import { collectionConfigs } from "../config/collectionConfigs";

const CollectionEditor = ({
  section,
  onChange,
  context = "page",
  showSectionInfo = true, // Step 1: Added showSectionInfo prop with default true
}) => {
  const config = collectionConfigs[section.type];

  if (!config) {
    return null;
  }

  // Step 1: Modified showSectionInfo condition
  const shouldShowSectionInfo =
    showSectionInfo &&
    !(context === "homepage" && section.type === "list");

  // Step 3: Filter fields based on context
  const visibleFields = config.fields.filter((field) => {
    if (!field.showIn) return true;
    return field.showIn.includes(context);
  });

  const collectionKey = config.collectionKey;
  const items = section[collectionKey] || [];

  const updateSection = (updatedCollection) => {
    onChange({
      ...section,
      [collectionKey]: updatedCollection,
    });
  };

  const addItem = () => {
    const newItem = {};
    // Step 4: Use visibleFields instead of config.fields
    visibleFields.forEach((field) => {
      newItem[field.key] = "";
    });
    if (newItem.label !== undefined || visibleFields.some((f) => f.key === "label" || f.key === "text")) {
      newItem.label = newItem.label || "";
      newItem.text = newItem.label || "";
    }
    updateSection([...items, newItem]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    const updatedObj = { ...updated[index], [key]: value };
    if (key === "label") {
      updatedObj.text = value;
    } else if (key === "text") {
      updatedObj.label = value;
    }
    updated[index] = updatedObj;
    updateSection(updated);
  };

  const deleteItem = (index) => {
    if (window.confirm("Delete this item?")) {
      updateSection(items.filter((_, i) => i !== index));
    }
  };

  const duplicateItem = (index) => {
    const copy = [...items];
    const original = items[index];
    const originalLabel = original.label || original.text || original.title || "Item";
    copy.splice(index + 1, 0, {
      ...original,
      ...(original.label !== undefined || original.text !== undefined
        ? { label: `${originalLabel} (Copy)`, text: `${originalLabel} (Copy)` }
        : {}),
      ...(original.title !== undefined ? { title: `${originalLabel} (Copy)` } : {}),
    });
    updateSection(copy);
  };

  // Get field groups for layout (image first)
  const getFieldGroups = (fields) => {
    // Move image field to the front if it exists
    const imageField = fields.find(f => f.type === "image");
    const imagesField = fields.find(f => f.type === "images");
    const otherFields = fields.filter(f => f.type !== "image" && f.type !== "images");
    const textareaFields = otherFields.filter(f => f.type === "textarea");
    const regularFields = otherFields.filter(f => f.type !== "textarea");
    
    return {
      imageField,
      imagesField,
      regularFields,
      textareaFields
    };
  };

  // Use visibleFields for field groups
  const { imageField, imagesField, regularFields, textareaFields } =
    getFieldGroups(visibleFields);

  const getFieldOptions = (field, currentValue) => {
    // If editing notices and section has cards configured
    if (field.key === "category" && Array.isArray(section.cards) && section.cards.length > 0) {
      const cardOptions = section.cards.map((c) => ({
        value: c.id || c.title,
        label: c.title ? `${c.title} (${c.id})` : (c.id || "Card"),
      }));

      // Preserve existing value if not already in options (e.g. legacy category names)
      if (
        currentValue &&
        !cardOptions.some(
          (opt) =>
            opt.value === currentValue ||
            opt.value.toLowerCase() === currentValue.toLowerCase()
        )
      ) {
        cardOptions.unshift({
          value: currentValue,
          label: `${currentValue} (Current)`,
        });
      }
      return cardOptions;
    }

    return (field.options || []).map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt }
    );
  };

  return (
    <>
      {/* Step 2: Replace Section Title and Subtitle with conditional wrapper */}
      {shouldShowSectionInfo && (
        <>
          {/* List Layout Style Selector */}
          {section.type === "list" && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                List Display Style
              </label>
              <p className="text-xs text-gray-500 mb-3.5">
                Select between the classic boxed layout or the modern editorial cards
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...section, layout: "rectangle" })}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    (!section.layout || section.layout === "rectangle")
                      ? "border-amber-600 bg-white ring-2 ring-amber-500/20 shadow-sm"
                      : "border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white text-gray-600"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                      (!section.layout || section.layout === "rectangle")
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <div className="w-2 h-2 bg-current rotate-45" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Rectangle (Old)
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Classic rectangular boxes with diamond bullets
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ ...section, layout: "editorial" })}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    section.layout === "editorial"
                      ? "border-amber-600 bg-white ring-2 ring-amber-500/20 shadow-sm"
                      : "border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white text-gray-600"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      section.layout === "editorial"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    01
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Editorial Cards (New)
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Modern cards with numbered badges & titles
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Eyebrow / Tag */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Eyebrow Tag / Category Label
            </label>
            <p className="text-xs text-gray-500 mb-2">
              The category text shown in capital letters above the section title (e.g. Highlights &amp; Values).
            </p>
            <input
              type="text"
              value={section.eyebrow !== undefined ? section.eyebrow : ""}
              placeholder={section.type === "list" ? "Highlights & Values" : "e.g., Section Category"}
              onChange={(e) =>
                onChange({
                  ...section,
                  eyebrow: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm"
            />
          </div>

          {/* Section Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={section.title || ""}
              onChange={(e) =>
                onChange({
                  ...section,
                  title: e.target.value,
                })
              }
              placeholder="e.g., Core Principles & Strengths"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subtitle / Description
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Displayed directly below the section title as introductory or contextual text.
            </p>
            <textarea
              rows={3}
              value={section.subtitle || ""}
              onChange={(e) =>
                onChange({
                  ...section,
                  subtitle: e.target.value,
                })
              }
              placeholder="Enter section subtitle or description..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
            />
          </div>
        </>
      )}

      {/* Items */}
      <div className="space-y-6">
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <div>
                  <h4 className="font-semibold text-lg">
                    {item.label || item.text || item.title || item.name || item.year || `Item ${index + 1}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">
                      {config.title} #{index + 1}
                    </p>
                    {item.category && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                        {section.cards?.find((c) => c.id === item.category || c.title === item.category)?.title || item.category}
                      </span>
                    )}
                    {item.status && item.status !== "NONE" && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-5">
                {/* Image Field - Always first */}
                {imageField && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {imageField.label}
                    </label>
                    <MediaPicker
                      type="image"
                      label={imageField.label}
                      value={item[imageField.key] || null}
                      onChange={(media) =>
                        updateItem(index, imageField.key, media)
                      }
                    />
                  </div>
                )}

                {/* Images Field - Multiple images */}
                {imagesField && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {imagesField.label}
                    </label>
                    <MediaPicker
                      type="image"
                      label={imagesField.label}
                      multiple={true}
                      value={item[imagesField.key] || []}
                      onChange={(media) =>
                        updateItem(index, imagesField.key, media)
                      }
                    />
                  </div>
                )}

                {/* Regular Fields - Two columns */}
                {regularFields.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-5">
                    {regularFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {field.label}
                        </label>
                        
                        {/* Text input */}
                        {field.type === "text" && (
                          <input
                            type="text"
                            value={
                              (item[field.key] !== undefined && item[field.key] !== ""
                                ? (typeof item[field.key] === "object" ? item[field.key].text || "" : item[field.key])
                                : (field.key === "label"
                                    ? (item.label || item.text || item.title || "")
                                    : field.key === "text"
                                    ? (item.text || item.label || item.title || "")
                                    : field.key === "title"
                                    ? (item.title || item.label || item.text || "")
                                    : (item[field.key] || ""))) || ""
                            }
                            onChange={(e) =>
                              updateItem(index, field.key, e.target.value)
                            }
                            placeholder={`Enter ${field.label}`}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          />
                        )}
                        
                        {/* Date input */}
                        {field.type === "date" && (
                          <input
                            type="date"
                            value={item[field.key] || ""}
                            onChange={(e) =>
                              updateItem(index, field.key, e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          />
                        )}
                        
                        {/* Select dropdown */}
                        {field.type === "select" && (() => {
                          const options = getFieldOptions(field, item[field.key]);
                          return (
                            <select
                              value={item[field.key] || ""}
                              onChange={(e) =>
                                updateItem(index, field.key, e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            >
                              <option value="">Select {field.label}</option>
                              {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                        
                        {/* File upload */}
                        {field.type === "file" && (
                          <MediaPicker
                            type="document"
                            label={field.label}
                            value={item[field.key] || null}
                            onChange={(media) =>
                              updateItem(index, field.key, media)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Textarea Fields - Full width */}
                {textareaFields.length > 0 && (
                  <div className="space-y-5">
                    {textareaFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {field.label}
                        </label>
                        <textarea
                          rows={4}
                          value={
                            (item[field.key] !== undefined
                              ? (typeof item[field.key] === "object" ? item[field.key].text || "" : item[field.key])
                              : (field.key === "description" ? item.text : field.key === "text" ? item.description : "")) || ""
                          }
                          onChange={(e) =>
                            updateItem(index, field.key, e.target.value)
                          }
                          placeholder={`Enter ${field.label}`}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item */}
      <div className="mt-8">
        <button
          type="button"
          onClick={addItem}
          className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
        >
          + Add {config.addButtonLabel || config.title}
        </button>
      </div>
    </>
  );
};

export default CollectionEditor;