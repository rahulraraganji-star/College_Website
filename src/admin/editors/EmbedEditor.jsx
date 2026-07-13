import SectionCard from "../components/SectionCard";

const EmbedEditor = ({
  section,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {

  const updateField = (field, value) => {

    onChange({
      ...section,
      [field]: value,
    });

  };

  return (

    <SectionCard
      title="Embed Content"
      icon="🔗"
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >

      {/* TITLE */}

      <div className="mb-6">

        <label className="block text-sm font-medium mb-2">

          Section Title

        </label>

        <input
          type="text"
          value={section.title || ""}
          onChange={(e)=>
            updateField(
              "title",
              e.target.value
            )
          }
          placeholder="Campus Location"
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* EMBED TYPE */}

      <div className="mb-6">

        <label className="block text-sm font-medium mb-2">

          Embed Type

        </label>

        <select
          value={section.embedType || "iframe"}
          onChange={(e)=>
            updateField(
              "embedType",
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3"
        >

          <option value="iframe">

            Generic iFrame

          </option>

          <option value="youtube">

            YouTube

          </option>

          <option value="google-map">

            Google Maps

          </option>

          <option value="google-calendar">

            Google Calendar

          </option>

          <option value="google-form">

            Google Form

          </option>

          <option value="pdf">

            PDF Viewer

          </option>

        </select>

      </div>

      {/* URL */}

      <div className="mb-6">

        <label className="block text-sm font-medium mb-2">

          Embed URL

        </label>

        <input
          type="url"
          value={section.url || ""}
          onChange={(e)=>
            updateField(
              "url",
              e.target.value
            )
          }
          placeholder="https://..."
          className="w-full border rounded-xl px-4 py-3"
        />

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
            onChange={(e)=>
              updateField(
                "height",
                Number(e.target.value)
              )
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
            onChange={(e)=>
              updateField(
                "width",
                e.target.value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

      </div>

            {/* OPTIONS */}

      <div className="mt-6 space-y-6">

        <div className="flex items-center justify-between border rounded-xl p-4">

          <div>

            <h3 className="font-medium">

              Allow Fullscreen

            </h3>

            <p className="text-sm text-gray-500">

              Allow the embedded content to enter fullscreen mode.

            </p>

          </div>

          <input
            type="checkbox"
            checked={section.allowFullscreen ?? true}
            onChange={(e) =>
              updateField(
                "allowFullscreen",
                e.target.checked
              )
            }
            className="h-5 w-5"
          />

        </div>

        <div className="flex items-center justify-between border rounded-xl p-4">

          <div>

            <h3 className="font-medium">

              Lazy Loading

            </h3>

            <p className="text-sm text-gray-500">

              Load the embed only when it becomes visible.

            </p>

          </div>

          <input
            type="checkbox"
            checked={section.lazyLoad ?? true}
            onChange={(e) =>
              updateField(
                "lazyLoad",
                e.target.checked
              )
            }
            className="h-5 w-5"
          />

        </div>

        <div className="flex items-center justify-between border rounded-xl p-4">

          <div>

            <h3 className="font-medium">

              Responsive

            </h3>

            <p className="text-sm text-gray-500">

              Automatically fit the container width.

            </p>

          </div>

          <input
            type="checkbox"
            checked={section.responsive ?? true}
            onChange={(e) =>
              updateField(
                "responsive",
                e.target.checked
              )
            }
            className="h-5 w-5"
          />

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-8">

        <label className="block text-sm font-medium mb-3">

          Preview

        </label>

        <div className="border-2 border-dashed rounded-2xl h-72 flex flex-col items-center justify-center text-center bg-gray-50">

          <div className="text-5xl mb-4">

            🔗

          </div>

          <p className="font-semibold">

            Live Preview

          </p>

          <p className="text-sm text-gray-500 mt-2 max-w-md">

            A live preview will appear here after the Media &
            Embed module is completed.

          </p>

        </div>

      </div>

      {/* HELP */}

      <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">

        <h3 className="font-semibold mb-3">

          Supported Embeds

        </h3>

        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">

          <li>Google Maps</li>

          <li>YouTube Videos</li>

          <li>Google Calendar</li>

          <li>Google Forms</li>

          <li>PDF Viewer</li>

          <li>Generic iframe URLs</li>

        </ul>

      </div>

    </SectionCard>

  );

};

export default EmbedEditor;