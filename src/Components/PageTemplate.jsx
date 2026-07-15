import Card from "./Card";

const hasData = (section) => {

  switch (section.type) {

    case "hero":
      return true;

    case "heading":
      return Boolean(section.text?.trim());

    case "richText":
      return Boolean(section.content?.trim());

    case "list":
      return Array.isArray(section.items) &&
        section.items.length > 0;

    case "timeline":
      return Array.isArray(section.events) &&
        section.events.length > 0;

    case "faculty-grid":
      return Array.isArray(section.departments) &&
        section.departments.length > 0;

    case "gallery":
      return Array.isArray(section.images) &&
        section.images.length > 0;

    case "table":
      return Array.isArray(section.rows) &&
        section.rows.length > 0;

    case "documentList":
      return Array.isArray(section.documents) &&
        section.documents.length > 0;

    case "eventList":
      return Array.isArray(section.events) &&
        section.events.length > 0;

    case "embed":
      return Boolean(section.url);

    default:
      return false;

  }

};

const PageTemplate = ({ data }) => {

  if (!data) {

    return (

      <div className="min-h-[300px] flex items-center justify-center">

        <p className="text-gray-400 text-lg">

          No content available

        </p>

      </div>

    );

  }

  const safeSections = Array.isArray(data.sections)
    ? data.sections
    : [];

  const heroSection = safeSections.find(
    (section) => section.type === "hero"
  );

  const heroSections = heroSection
    ? [heroSection]
    : [];

  const contentSections = safeSections.filter(
    (section) =>
      section.type !== "hero" &&
      hasData(section)
  );

  return (

    <section className="space-y-12">

      {/* PAGE TITLE */}

      {!heroSection && (

        <div>

          <h1 className="text-4xl font-bold tracking-tight">

            {data.title}

          </h1>

        </div>

      )}

      {/* HERO */}

      {heroSections.map((section, index) => {

        const hasHeroContent =
          section.subheading ||
          section.backgroundImage ||
          section.backgroundVideo ||
          section.buttonText;

        if (!hasHeroContent) return null;

        return (

          <section
            key={index}
            className="rounded-3xl border bg-neutral-50 p-10"
          >

            {section.heading && (

              <h2 className="text-3xl font-bold">

                {section.heading}

              </h2>

            )}

            {section.subheading && (

              <p className="mt-4 text-lg text-neutral-600">

                {section.subheading}

              </p>

            )}

          </section>

        );

      })}

      {/* EMPTY STATE */}

      {contentSections.length === 0 && (

        <div className="py-20 text-center">

          <p className="text-gray-500">

            Content will be updated soon.

          </p>

        </div>

      )}

      {/* SECTION RENDERING */}

      {contentSections.map((section, index) => {

        switch (section.type) {
                    /* -----------------------------
              HEADING
          ----------------------------- */

          case "heading":

            return (

              <section
                key={index}
                className="pt-10"
              >

                <h2
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    border-b
                    border-neutral-200
                    pb-4
                  "
                >

                  {section.text}

                </h2>

              </section>

            );

          /* -----------------------------
              RICH TEXT
          ----------------------------- */

          case "richText":

            return (

              <section
                key={index}
                className="space-y-6"
              >

                {section.heading && (

                  <h2 className="text-3xl font-bold">

                    {section.heading}

                  </h2>

                )}

                <div
                  className="
                    whitespace-pre-wrap
                    leading-8
                    text-neutral-700
                    text-[17px]
                  "
                >

                  {section.content}

                </div>

              </section>

            );

          /* -----------------------------
              LIST
          ----------------------------- */

          case "list":

            return (

              <section
                key={index}
                className="space-y-6"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <ul
                  className="
                    list-disc
                    pl-6
                    space-y-3
                    text-neutral-700
                  "
                >

                  {section.items.map(

                    (item, i) => (

                      <li key={i}>

                        {item}

                      </li>

                    )

                  )}

                </ul>

              </section>

            );

          /* -----------------------------
              TIMELINE
          ----------------------------- */

          case "timeline":

            return (

              <section
                key={index}
                className="space-y-8"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div
                  className="
                    border-l-2
                    border-neutral-300
                    pl-8
                    space-y-8
                  "
                >

                  {section.events.map(

                    (event, i) => (

                      <div
                        key={i}
                        className="relative"
                      >

                        <div
                          className="
                            absolute
                            -left-[38px]
                            top-2
                            w-3
                            h-3
                            rounded-full
                            bg-black
                          "
                        />

                        <h3 className="font-bold text-lg">

                          {event.year}

                        </h3>

                        <p className="mt-2 text-neutral-700">

                          {event.text}

                        </p>

                      </div>

                    )

                  )}

                </div>

              </section>

            );

          /* -----------------------------
              DOCUMENTS
          ----------------------------- */

          case "documentList":

            return (

              <section
                key={index}
                className="space-y-6"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div className="space-y-4">

                  {section.documents.map(

                    (doc, i) => (

                      <div
                        key={i}
                        className="
                          border
                          rounded-2xl
                          p-5
                          flex
                          justify-between
                          items-center
                        "
                      >

                        <div>

                          <h3 className="font-semibold">

                            {doc.title}

                          </h3>

                          {doc.description && (

                            <p className="text-sm text-neutral-500 mt-1">

                              {doc.description}

                            </p>

                          )}

                        </div>

                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline"
                        >

                          Open

                        </a>

                      </div>

                    )

                  )}

                </div>

              </section>

            );

          /* -----------------------------
              EVENTS
          ----------------------------- */

          case "eventList":

            return (

              <section
                key={index}
                className="space-y-6"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div className="space-y-5">

                  {section.events.map(

                    (event, i) => (

                      <div
                        key={i}
                        className="
                          border
                          rounded-2xl
                          p-6
                          bg-white
                        "
                      >

                        <h3 className="text-xl font-semibold">

                          {event.title}

                        </h3>

                        {event.date && (

                          <p className="text-sm text-neutral-500 mt-1">

                            {event.date}

                          </p>

                        )}

                        {event.description && (

                          <p className="mt-4 text-neutral-700 leading-7">

                            {event.description}

                          </p>

                        )}

                      </div>

                    )

                  )}

                </div>

              </section>

            );
                      /* -----------------------------
              GALLERY
          ----------------------------- */

          case "gallery":

            return (

              <section
                key={index}
                className="space-y-8"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div
                  className={`
                    grid
                    gap-6
                    ${
                      section.columns === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : section.columns === 4
                        ? "grid-cols-2 lg:grid-cols-4"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }
                  `}
                >

                  {(section.images || []).map(

                    (image, i) => (

                      <div
                        key={i}
                        className="overflow-hidden rounded-2xl border bg-white"
                      >

                        <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">

                          {image.image ? (

                            <img
                              src={image.image}
                              alt={image.alt || ""}
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="text-neutral-400">

                              No Image

                            </div>

                          )}

                        </div>

                        {(image.caption || image.alt) && (

                          <div className="p-4">

                            {image.caption && (

                              <h3 className="font-semibold">

                                {image.caption}

                              </h3>

                            )}

                            {image.alt && (

                              <p className="text-sm text-neutral-500 mt-1">

                                {image.alt}

                              </p>

                            )}

                          </div>

                        )}

                      </div>

                    )

                  )}

                </div>

              </section>

            );

          /* -----------------------------
              FACULTY GRID
          ----------------------------- */

          case "faculty-grid":

            return (

              <section
                key={index}
                className="space-y-12"
              >

                {section.title && (

                  <h2 className="text-3xl font-bold">

                    {section.title}

                  </h2>

                )}

                {(section.departments || []).map(

                  (department, departmentIndex) => (

                    <div
                      key={department.id || departmentIndex}
                      className="space-y-8"
                    >

                      <div className="border-b pb-3">

                        <h3 className="text-2xl font-semibold">

                          {department.name}

                        </h3>

                      </div>

                      <div
                        className="
                          grid
                          grid-cols-1
                          md:grid-cols-2
                          xl:grid-cols-3
                          gap-8
                        "
                      >

                        {(department.members || []).map(

                          (member, memberIndex) => (

                            <Card
                              key={
                                member.id ||
                                memberIndex
                              }
                              item={member}
                            />

                          )

                        )}

                      </div>

                    </div>

                  )

                )}

              </section>

            );

                      /* -----------------------------
              TABLE
          ----------------------------- */

          case "table":

            return (

              <section
                key={index}
                className="space-y-8"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div className="overflow-x-auto rounded-2xl border">

                  <table className="min-w-full border-collapse">

                    <thead className="bg-neutral-100">

                      <tr>

                        {(section.headers || []).map(

                          (header, i) => (

                            <th
                              key={i}
                              className="border px-6 py-4 text-left font-semibold"
                            >

                              {header}

                            </th>

                          )

                        )}

                      </tr>

                    </thead>

                    <tbody>

                      {(section.rows || []).map(

                        (row, rowIndex) => (

                          <tr
                            key={rowIndex}
                            className="hover:bg-neutral-50"
                          >

                            {row.map(

                              (cell, cellIndex) => (

                                <td
                                  key={cellIndex}
                                  className="border px-6 py-4"
                                >

                                  {cell}

                                </td>

                              )

                            )}

                          </tr>

                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            );

          /* -----------------------------
              EMBED
          ----------------------------- */

          case "embed":

            return (

              <section
                key={index}
                className="space-y-6"
              >

                {section.title && (

                  <h2 className="text-2xl font-bold">

                    {section.title}

                  </h2>

                )}

                <div className="overflow-hidden rounded-2xl border">

                  <iframe
                    src={section.url}
                    title={section.title || "Embedded Content"}
                    width={section.responsive ? "100%" : (section.width || "100%")}
                    height={section.height || 500}
                    loading={section.lazyLoad ? "lazy" : "eager"}
                    allowFullScreen={section.allowFullscreen}
                    className="border-0 w-full"
                  />

                </div>

              </section>

            );

          /* -----------------------------
              DEFAULT
          ----------------------------- */

          default:

            return null;

        }

      })}

    </section>

  );

};

export default PageTemplate;