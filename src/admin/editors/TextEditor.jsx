const TextEditor = ({
  section,
  onChange,
}) => {

  const updateField = (field, value) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  return (

    <>

      {/* HEADING */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Heading
        </label>

        <input
          type="text"
          value={
            section.type === "heading"
              ? section.text || ""
              : section.heading || ""
          }
          onChange={(e) =>
            updateField(
              section.type === "heading"
                ? "text"
                : "heading",
              e.target.value
            )
          }
          placeholder="Enter heading"
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* RICH TEXT ONLY */}

      {section.type === "richText" && (

        <div className="mt-6">

          <label className="block text-sm font-medium mb-2">
            Content
          </label>

          <textarea
            rows={10}
            value={section.content || ""}
            onChange={(e) =>
              updateField(
                "content",
                e.target.value
              )
            }
            placeholder="Enter page content..."
            className="w-full border rounded-xl px-4 py-3 resize-y"
          />

        </div>

      )}

    </>

  );

};

export default TextEditor;