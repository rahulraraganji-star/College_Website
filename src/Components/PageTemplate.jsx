import { useEffect, useState } from "react";

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
      return Array.isArray(section.documents) && section.documents.length > 0;
    case "gallery":
      return Array.isArray(section.images) && section.images.length > 0;
    case "embed":
      return Boolean(section.url);
    case "hero":
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

  const contentSections = data.sections?.filter(
    (section) => section.type !== "hero" && hasData(section)
  );

  const heroSections =
    contentSections.length > 0
      ? data.sections?.filter((s) => s.type === "hero")
      : [];

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold">{data.title}</h1>

      {heroSections.map((section, i) => (
        <div key={i} className="py-4 space-y-1">
          {section.heading && <h2 className="text-2xl font-bold">{section.heading}</h2>}
          {section.subheading && <p className="text-gray-500">{section.subheading}</p>}
        </div>
      ))}

      {contentSections.length === 0 && (
        <p className="text-gray-500">Content will be updated soon.</p>
      )}

      {contentSections.map((section, i) => {
        switch (section.type) {
          case "content":
            return (
              <div key={i}>
                {section.heading && <h3 className="text-xl font-semibold">{section.heading}</h3>}
                <p className="text-gray-700">{section.body}</p>
              </div>
            );

          case "richText":
            return (
              <div key={i}>
                {section.heading && <h3 className="text-xl font-semibold">{section.heading}</h3>}
                <p className="text-gray-700">{section.content}</p>
              </div>
            );

          case "timeline":
            return (
              <ul key={i} className="border-l-2 pl-4 space-y-2">
                {section.events.map((e, j) => (
                  <li key={j}>
                    <strong>{e.year}</strong> — {e.text}
                  </li>
                ))}
              </ul>
            );

          case "list":
            return (
              <ul key={i} className="list-disc pl-6">
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </section>
  );
};

export default PageTemplate;
