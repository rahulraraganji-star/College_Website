import SectionCard from "../components/SectionCard";
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

    updateSection([
      ...items,
      newItem,
    ]);

  };

  const updateItem = (
    index,
    key,
    value
  ) => {

    const updated = [...items];

    updated[index][key] = value;

    updateSection(updated);

  };

  const deleteItem = (index) => {

    updateSection(
      items.filter(
        (_, i) => i !== index
      )
    );

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

        <label className="block text-sm font-medium mb-2">

          Section Title

        </label>

        <input
          type="text"
          value={section.title || ""}
          onChange={(e)=>
            onChange({
              ...section,
              title: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* Items */}

      <div className="space-y-6">

        {items.map((item, index) => (

          <div
            key={index}
            className="border rounded-xl p-5 bg-gray-50"
          >

            <div className="flex items-center justify-between mb-5">

              <h4 className="font-semibold">

                Item {index + 1}

              </h4>

              <button
                type="button"
                onClick={() =>
                  deleteItem(index)
                }
                className="text-red-500"
              >

                Delete

              </button>

            </div>
            {config.fields.map((field) => (

              <div
                key={field.key}
                className="mb-5"
              >

                <label className="block text-sm font-medium mb-2">

                  {field.label}

                </label>

                {/* TEXT */}

                {field.type === "text" && (

                  <input
                    type="text"
                    value={item[field.key] || ""}
                    onChange={(e)=>
                      updateItem(
                        index,
                        field.key,
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  />

                )}

                {/* TEXTAREA */}

                {field.type === "textarea" && (

                  <textarea
                    rows={4}
                    value={item[field.key] || ""}
                    onChange={(e)=>
                      updateItem(
                        index,
                        field.key,
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  />

                )}

                {/* DATE */}

                {field.type === "date" && (

                  <input
                    type="date"
                    value={item[field.key] || ""}
                    onChange={(e)=>
                      updateItem(
                        index,
                        field.key,
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  />

                )}

                {/* FILE PLACEHOLDER */}

                {field.type === "file" && (

                  <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-500">

                    Upload functionality will be added later

                  </div>

                )}

              </div>

            ))}

          </div>

        ))}

      </div>

      {/* ADD ITEM */}

      <div className="mt-8">

        <button
          type="button"
          onClick={addItem}
          className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-900"
        >

          + Add {config.title}

        </button>

      </div>

    </SectionCard>

  );

};

export default CollectionEditor;
