import SectionCard from "../components/SectionCard";
import MediaPicker from "../media/components/MediaPicker";
import { collectionConfigs } from "../config/collectionConfigs";

const CollectionEditor = ({
  section,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const config = collectionConfigs[section.type];

  if (!config) {
    return null;
  }

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
    config.fields.forEach((field) => {
      newItem[field.key] = "";
    });
    updateSection([...items, newItem]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    updateSection(updated);
  };

  const deleteItem = (index) => {
    if (window.confirm("Delete this item?")) {
      updateSection(items.filter((_, i) => i !== index));
    }
  };

  const duplicateItem = (index) => {
    const copy = [...items];
    copy.splice(index + 1, 0, {
      ...items[index],
      title: `${items[index].title || "Item"} (Copy)`, // Add "(Copy)" to the title for clarity
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

  return (
    <SectionCard
      title={config.title}
      icon={config.icon}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
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
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      {/* Items */}
      <div className="space-y-6">
        {items.map((item, index) => {
          const { imageField, imagesField, regularFields, textareaFields } = getFieldGroups(config.fields);
          

          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <div>
                  <h4 className="font-semibold text-lg">
                    {item.title || item.name || item.year || `Item ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {config.title} #{index + 1}
                  </p>
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
                            value={item[field.key] || ""}
                            onChange={(e) =>
                              updateItem(index, field.key, e.target.value)
                            }
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
                        {field.type === "select" && (
                          <select
                            value={item[field.key] || ""}
                            onChange={(e) =>
                              updateItem(index, field.key, e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                        
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
                          value={item[field.key] || ""}
                          onChange={(e) =>
                            updateItem(index, field.key, e.target.value)
                          }
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
    </SectionCard>
  );
};

export default CollectionEditor;