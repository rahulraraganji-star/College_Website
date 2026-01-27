import { useEffect, useState } from "react";

/**
 * Determines whether a section has real, visible content
 * (headings alone are NOT sufficient)
 */
const hasData = (section) => {
  switch (section.type) {
    case "content":
      return Boolean(section.body?.trim());

    case "richText":
      return Boolean(section.content?.trim());

    case "timeline":
      return Array.isArray(section.events) && section.events.length > 0;

    case "list":
      return Array.isArray(section.items) && section.items.length > 0;

    case "eventList":
      return Array.isArray(section.events) && section.events.length > 0;

    case "table":
      return Array.isArray(section.rows) && section.rows.length > 0;

    case "documents":
    case "documentList":
      return (
        Array.isArray(section.documents) &&
        section.documents.length > 0
      );

    case "gallery":
      return Array.isArray(section.images) && section.images.length > 0;

    case "embed":
      return Boolean(section.url);

    case "hero":
      // Hero is allowed but controlled separately
      return true;

    default:
      return false;
  }
};

const PageTemplate = ({ slug }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/pages/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Page not found");
        return res.json();
      })
      .then((page) => {
        setData(page);
        setLoading(false);
      })
      .catch(() => {
        setError("Page not found");
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return null;

  // Only sections that actually have content
  const contentSections = data.sections?.filter(
    (section) =>
      section.type !== "hero" && hasData(section)
  );

  // Show hero ONLY if real content exists
  const heroSections =
    contentSections.length > 0
      ? data.sections?.filter((s) => s.type === "hero")
      : [];

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold">
        {data.title}
      </h1>

      {/* HERO */}
      {heroSections.map((section, index) => (
        <div key={index} className="py-4 space-y-1">
          {section.heading && (
            <h2 className="text-2xl font-bold">
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className="text-gray-500">
              {section.subheading}
            </p>
          )}
        </div>
      ))}

      {/* FALLBACK */}
      {contentSections.length === 0 && (
        <p className="text-gray-500">
          Content will be updated soon.
        </p>
      )}

      {/* CONTENT SECTIONS */}
      {contentSections.map((section, index) => {
        switch (section.type) {
          case "content":
            return (
              <div key={index} className="space-y-2">
                {section.heading && (
                  <h3 className="text-xl font-semibold">
                    {section.heading}
                  </h3>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {section.body}
                </p>
              </div>
            );

          case "richText":
            return (
              <div key={index} className="space-y-2">
                {section.heading && (
                  <h3 className="text-xl font-semibold">
                    {section.heading}
                  </h3>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            );

          case "timeline":
            return (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Timeline
                </h3>
                <ul className="border-l-2 pl-4 space-y-3">
                  {section.events.map((event, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-3 top-1.5 w-2 h-2 bg-black rounded-full" />
                      <div className="ml-2">
                        <strong>{event.year}</strong>{" "}
                        — {event.text}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "list":
            return (
              <ul
                key={index}
                className="list-disc pl-6 text-gray-700"
              >
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case "eventList":
            return (
              <div key={index} className="space-y-4">
                {section.heading && (
                  <h3 className="text-xl font-semibold">
                    {section.heading}
                  </h3>
                )}
                <ul className="space-y-2">
                  {section.events.map((event, i) => (
                    <li
                      key={i}
                      className="border p-3 rounded-md"
                    >
                      <strong>{event.title}</strong>
                      {event.date && (
                        <div className="text-sm text-gray-500">
                          {event.date}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-gray-700 mt-1">
                          {event.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );

          default:
            return null;
        }
      })}
    </section>
  );
};

export default PageTemplate;
