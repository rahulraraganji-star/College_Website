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

    setData(null);
    setError(null);
    setLoading(true);

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

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">No content available</p>
      </div>
    );
  }

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

      {/* HERO */}
      {heroSections.map((section, i) => (
        <div key={i} className="py-4 space-y-1">
          {section.heading && (
            <h2 className="text-2xl font-bold">{section.heading}</h2>
          )}
          {section.subheading && (
            <p className="text-gray-500">{section.subheading}</p>
          )}
        </div>
      ))}

      {contentSections.length === 0 && (
        <p className="text-gray-500">Content will be updated soon.</p>
      )}

      {contentSections.map((section, i) => {
        switch (section.type) {
          case "content":
            return (
              <div key={i} className="space-y-2">
                {section.heading && (
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                )}
                <p className="text-gray-700 leading-relaxed">{section.body}</p>
              </div>
            );

          case "richText":
            return (
              <div key={i} className="space-y-2">
                {section.heading && (
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            );

          case "timeline":
            return (
              <div key={i} className="space-y-4">
                <h3 className="text-xl font-semibold">Timeline</h3>
                <ul className="border-l-2 pl-4 space-y-3">
                  {section.events.map((event, j) => (
                    <li key={j}>
                      <strong>{event.year}</strong> — {event.text}
                    </li>
                  ))}
                </ul>
              </div>
            );

          /* 🔥 UPDATED LIST → CARD DESIGN */
   case "list":
  return (
    <div key={i} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {section.items.map((item, j) => {
        const parts = item.split(" – ");

        const name = parts[0] || "";
        const role = parts[1] || "";

        return (
          <div
            key={j}
            className="bg-white rounded-3xl shadow-md p-5 transition hover:shadow-lg"
          >
            {/* Image */}
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt={name}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{name}</h3>

                {/* Verified badge */}
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓
                </span>
              </div>

              <p className="text-gray-600 text-sm">
                {role}
              </p>

              {/* Stats + Button */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-6 text-gray-500 text-sm">
                  <span>👤 312</span>
                  <span>📄 48</span>
                </div>

                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium">
                  Profile +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );


          case "eventList":
            return (
              <div key={i} className="space-y-3">
                {section.heading && (
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                )}
                {section.events.map((event, j) => (
                  <div key={j} className="border p-3 rounded-md">
                    <strong>{event.title}</strong>
                    {event.date && (
                      <div className="text-sm text-gray-500">{event.date}</div>
                    )}
                    {event.description && (
                      <p className="text-gray-700 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            );

          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                {section.heading && (
                  <h3 className="text-xl font-semibold mb-4">{section.heading}</h3>
                )}
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      {section.headers?.map((header, j) => (
                        <th key={j} className="border border-gray-300 p-3 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, j) => (
                      <tr key={j} className="hover:bg-gray-50">
                        {row.map((cell, k) => (
                          <td key={k} className="border border-gray-300 p-3">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "documents":
          case "documentList":
            return (
              <div key={i} className="space-y-3">
                {section.heading && (
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {section.documents.map((doc, j) => (
                    <div key={j} className="border p-4 rounded-lg hover:shadow-md">
                      <h4 className="font-semibold">{doc.title}</h4>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          Download →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "gallery":
            return (
              <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {section.heading && (
                  <h3 className="text-xl font-semibold col-span-full">{section.heading}</h3>
                )}
                {section.images.map((image, j) => (
                  <div key={j} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || "Gallery image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Image</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );

          case "embed":
            return (
              <div key={i} className="space-y-2">
                {section.heading && (
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                )}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={section.url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
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
