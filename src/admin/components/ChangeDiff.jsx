/**
 * ChangeDiff
 * Human-readable before/after comparison component.
 *
 * Supports:
 * - Normal flat page objects
 * - Nested Home sections
 * - Nested objects
 * - Arrays
 * - Media objects
 */

const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  role: "System Role",
  roleId: "Role",
  roleName: "Role Name",
  department: "Department",
  status: "Status",
  slug: "Slug",
  isActive: "Active",
  permissions: "Permissions",
  allowedPages: "Page Access",
  description: "Description",
  title: "Title",
  content: "Content",
  isPublished: "Published",
  parentSlug: "Section",

  // Home
  sections: "Sections",
  hero: "Hero",
  heroSection2: "Hero Section 2",
  eventsSection: "Events Section",
  eventsMarquee: "Events Marquee",
  coreStrengths: "Core Strengths",
  notices: "Notices",

  buttonText: "Button Text",
  caption: "Caption",
  image: "Image",
  slides: "Slides",

  heading: "Heading",
  subtitle: "Subtitle",
  subTitle: "Subtitle",
  desc: "Description",
  text: "Text",

  primaryButtonText: "Primary Button Text",
  secondaryButtonText: "Secondary Button Text",
  primaryButtonLink: "Primary Button Link",
  secondaryButtonLink: "Secondary Button Link",

  alignment: "Alignment",

  eventTitle: "Event Title",
  eventDescription: "Event Description",
  date: "Date",
  link: "Link",

  items: "Items",
};


/* ==========================================
   LABEL FORMATTER
========================================== */

const getLabel = (key) => {
  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key];
  }

  // camelCase → readable text
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};


/* ==========================================
   MEDIA OBJECT
========================================== */

const isMediaObject = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Boolean(
    value.filename ||
    value.originalName ||
    value.url ||
    value.mimeType
  );
};


/* ==========================================
   FORMAT MEDIA
========================================== */

const formatMedia = (media) => {
  const name =
    media.originalName ||
    media.filename ||
    "Media";

  return (
    <div className="space-y-1">
      <div className="font-medium text-gray-900">
        {name}
      </div>

      {media.url && (
        <div className="text-xs text-gray-500 break-all">
          {media.url}
        </div>
      )}
    </div>
  );
};


/* ==========================================
   FORMAT VALUE
========================================== */

const formatValue = (key, val) => {

  if (
    val === null ||
    val === undefined ||
    val === ""
  ) {
    return (
      <em className="text-gray-400">
        —
      </em>
    );
  }


  /* ------------------------------------------
     BOOLEAN
  ------------------------------------------ */

  if (typeof val === "boolean") {
    return val ? (
      <span className="text-green-700 font-medium">
        Yes
      </span>
    ) : (
      <span className="text-red-600 font-medium">
        No
      </span>
    );
  }


  /* ------------------------------------------
     MEDIA OBJECT
  ------------------------------------------ */

  if (isMediaObject(val)) {
    return formatMedia(val);
  }


  /* ------------------------------------------
     ARRAY
  ------------------------------------------ */

  if (Array.isArray(val)) {

    if (val.length === 0) {
      return (
        <em className="text-gray-400">
          None
        </em>
      );
    }


    /*
     * Array of simple values
     */

    if (
      val.every(
        (item) =>
          typeof item !== "object" ||
          item === null
      )
    ) {
      return (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {val.map((item, index) => (
            <span
              key={index}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }


    /*
     * Array of objects
     *
     * Instead of dumping JSON, show a
     * readable summary for each item.
     */

    return (
      <div className="space-y-2">

        {val.map((item, index) => {

          if (
            item === null ||
            typeof item !== "object"
          ) {
            return (
              <div
                key={index}
                className="text-sm text-gray-700"
              >
                {String(item)}
              </div>
            );
          }


          if (isMediaObject(item)) {
            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="text-xs text-gray-400 mr-2">
                  #{index + 1}
                </span>

                {formatMedia(item)}
              </div>
            );
          }


          /*
           * Try to show the most useful human-readable
           * fields instead of JSON.
           */

          const usefulFields = [
            "title",
            "name",
            "caption",
            "description",
            "desc",
            "text",
            "date",
            "heading",
          ];


          const visibleFields =
            usefulFields.filter(
              (field) =>
                item[field] !== undefined &&
                item[field] !== null &&
                item[field] !== ""
            );


          if (visibleFields.length > 0) {
            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div className="text-xs text-gray-400 mb-1">
                  Item {index + 1}
                </div>

                {visibleFields.map(
                  (field) => (
                    <div
                      key={field}
                      className="text-sm"
                    >
                      <span className="font-medium text-gray-600">
                        {getLabel(field)}:
                      </span>{" "}
                      <span className="text-gray-900">
                        {String(item[field])}
                      </span>
                    </div>
                  )
                )}
              </div>
            );
          }


          /*
           * Last fallback for unusual objects.
           * Pretty-print rather than one massive line.
           */

          return (
            <pre
              key={index}
              className="text-xs text-gray-600 whitespace-pre-wrap break-words"
            >
              {JSON.stringify(item, null, 2)}
            </pre>
          );
        })}

      </div>
    );
  }


  /* ------------------------------------------
     OBJECT
  ------------------------------------------ */

  if (typeof val === "object") {

    if (val.name) {
      return (
        <span className="text-gray-700">
          {val.name}
        </span>
      );
    }

    if (val._id) {
      return (
        <span className="text-gray-700">
          {val._id}
        </span>
      );
    }

    return (
      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }


  /* ------------------------------------------
     STRING / NUMBER
  ------------------------------------------ */

  return (
    <span className="text-gray-900">
      {String(val)}
    </span>
  );
};


/* ==========================================
   FLATTEN NESTED OBJECT
========================================== */

const flattenObject = (
  obj,
  prefix = "",
  result = {}
) => {

  if (!obj || typeof obj !== "object") {
    return result;
  }


  Object.entries(obj).forEach(
    ([key, value]) => {

      const path = prefix
        ? `${prefix}.${key}`
        : key;


      /*
       * Arrays remain a single field.
       *
       * This is important for:
       * slides
       * notices
       * events
       * coreStrengths
       *
       * Their formatter will display them
       * in a human-readable way.
       */

      if (Array.isArray(value)) {
        result[path] = value;
        return;
      }


      /*
       * Nested object → continue recursively.
       */

      if (
        value &&
        typeof value === "object" &&
        !isMediaObject(value)
      ) {
        flattenObject(
          value,
          path,
          result
        );

        return;
      }


      result[path] = value;
    }
  );


  return result;
};


/* ==========================================
   DISPLAY LABEL FOR NESTED FIELD
========================================== */

const getPathLabel = (path) => {

  const parts = path.split(".");

  if (parts.length === 1) {
    return getLabel(parts[0]);
  }


  const section = parts
    .slice(0, -1)
    .map(getLabel)
    .join(" → ");

  const field =
    getLabel(parts[parts.length - 1]);


  return (
    <span>
      <span className="text-gray-400">
        {section}
      </span>

      <span className="mx-1 text-gray-300">
        /
      </span>

      <span>
        {field}
      </span>
    </span>
  );
};


/* ==========================================
   CHANGE DIFF
========================================== */

const ChangeDiff = ({
  before,
  after,
}) => {

  if (!before && !after) {
    return (
      <p className="text-sm text-gray-400 italic">
        No change data recorded.
      </p>
    );
  }


  /* ==========================================
     FLATTEN BOTH OBJECTS
  ========================================== */

  const flatBefore =
    flattenObject(before || {});

  const flatAfter =
    flattenObject(after || {});


  const allKeys = Array.from(
    new Set([
      ...Object.keys(flatBefore),
      ...Object.keys(flatAfter),
    ])
  );


  /* ==========================================
     NEW RECORD
  ========================================== */

  if (!before && after) {

    return (
      <div className="rounded-xl border border-green-200 overflow-hidden">

        <div className="px-4 py-2.5 bg-green-50 border-b border-green-100">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-[0.1em]">
            ✅ New record — what will be added
          </p>
        </div>

        <table className="w-full text-sm">

          <tbody>

            {allKeys.map((key) => (

              <tr
                key={key}
                className="border-b border-gray-100 last:border-0"
              >

                <td className="w-64 px-4 py-2 text-xs font-semibold text-gray-400 align-top">
                  {getPathLabel(key)}
                </td>

                <td className="px-4 py-2 bg-green-50">
                  {formatValue(
                    key,
                    flatAfter[key]
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    );
  }


  /* ==========================================
     DELETION
  ========================================== */

  if (!after && before) {

    return (
      <div className="rounded-xl border border-red-200 overflow-hidden">

        <div className="px-4 py-2.5 bg-red-50 border-b border-red-100">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-[0.1em]">
            🗑️ Record will be removed
          </p>
        </div>

        <table className="w-full text-sm">

          <tbody>

            {allKeys.map((key) => (

              <tr
                key={key}
                className="border-b border-gray-100 last:border-0"
              >

                <td className="w-64 px-4 py-2 text-xs font-semibold text-gray-400 align-top">
                  {getPathLabel(key)}
                </td>

                <td className="px-4 py-2 bg-red-50 line-through text-gray-400">
                  {formatValue(
                    key,
                    flatBefore[key]
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    );
  }


  /* ==========================================
     FIND CHANGED FIELDS
  ========================================== */

  const changedKeys = allKeys.filter(
    (key) => {

      return (
        JSON.stringify(
          flatBefore[key] ?? null
        ) !==
        JSON.stringify(
          flatAfter[key] ?? null
        )
      );

    }
  );


  const unchangedKeys =
    allKeys.filter(
      (key) =>
        !changedKeys.includes(key)
    );


  /* ==========================================
     NO CHANGES
  ========================================== */

  if (changedKeys.length === 0) {

    return (
      <div className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400">
        No field changes recorded.
      </div>
    );
  }


  /* ==========================================
     UPDATED RECORD
  ========================================== */

  return (
    <div className="space-y-3">

      {/* ======================================
          CHANGED FIELDS
      ====================================== */}

      <div className="rounded-xl border border-gray-200 overflow-hidden">

        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.1em]">
            What will change &mdash;{" "}
            {changedKeys.length} field
            {changedKeys.length !== 1
              ? "s"
              : ""}
          </p>

        </div>


        <table className="w-full text-sm">

          <thead>

            <tr className="bg-gray-50 border-b border-gray-100">

              <th className="w-64 px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                Field
              </th>

              <th className="px-4 py-2 text-left text-xs font-semibold text-red-500 uppercase">
                Current
              </th>

              <th className="px-4 py-2 text-left text-xs font-semibold text-green-600 uppercase">
                Proposed
              </th>

            </tr>

          </thead>


          <tbody>

            {changedKeys.map(
              (key) => (

                <tr
                  key={key}
                  className="border-b border-gray-100 last:border-0"
                >

                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-500 align-top">
                    {getPathLabel(key)}
                  </td>


                  <td className="px-4 py-2.5 bg-red-50 align-top">

                    <span className="text-red-700 line-through decoration-red-300">

                      {formatValue(
                        key,
                        flatBefore[key]
                      )}

                    </span>

                  </td>


                  <td className="px-4 py-2.5 bg-green-50 align-top">

                    <span className="text-green-800 font-medium">

                      {formatValue(
                        key,
                        flatAfter[key]
                      )}

                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          UNCHANGED FIELDS
      ====================================== */}

      {unchangedKeys.length > 0 && (

        <details className="rounded-xl border border-gray-100">

          <summary className="px-4 py-2 text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600">

            {unchangedKeys.length} unchanged field
            {unchangedKeys.length !== 1
              ? "s"
              : ""}{" "}
            (click to expand)

          </summary>


          <table className="w-full text-sm">

            <tbody>

              {unchangedKeys.map(
                (key) => (

                  <tr
                    key={key}
                    className="border-t border-gray-100"
                  >

                    <td className="w-64 px-4 py-2 text-xs font-semibold text-gray-400 align-top">
                      {getPathLabel(key)}
                    </td>

                    <td className="px-4 py-2 text-gray-500">

                      {formatValue(
                        key,
                        flatAfter[key]
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </details>

      )}

    </div>
  );
};


export default ChangeDiff;