
import Card from "./Card";

const hasData = (section) => {

  switch (section.type) {

    case "content":
      return Boolean(
        section.body?.trim()
      );

    case "richText":
      return Boolean(
        section.content?.trim()
      );

    case "heading":
      return Boolean(
        section.text?.trim()
      );

    case "timeline":
      return (
        Array.isArray(section.events) &&
        section.events.length > 0
      );

    case "list":
      return (
        Array.isArray(section.items) &&
        section.items.length > 0
      );

    case "faculty-grid":
      return (
        Array.isArray(section.items) &&
        section.items.length > 0
      );

    case "eventList":
      return (
        Array.isArray(section.events) &&
        section.events.length > 0
      );

    case "table":
      return (
        Array.isArray(section.rows) &&
        section.rows.length > 0
      );

    case "documents":
    case "documentList":
      return (
        Array.isArray(section.documents) &&
        section.documents.length > 0
      );

    case "gallery":
      return (
        Array.isArray(section.images) &&
        section.images.length > 0
      );

    case "embed":
      return Boolean(section.url);

    case "hero":
      return true;

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

  /* SAFE */
  const safeSections =
    Array.isArray(data.sections)
      ? data.sections
      : [];

  /* CONTENT */
  const contentSections =
    safeSections.filter(
      (section) =>
        section.type !== "hero" &&
        hasData(section)
    );

  /* HERO */
  const heroSections =
    safeSections.filter(
      (s) => s.type === "hero"
    );

  return (

    <section className="space-y-10">

      {/* TITLE */}
      <div className="space-y-3">

        <h1
          className="
            text-4xl
            font-bold
            tracking-tight
            text-neutral-900
          "
        >

          {data.title}

        </h1>

      </div>

      {/* HERO */}
      {heroSections.map((section, i) => (

        <div
          key={i}
          className="
            rounded-3xl
            border
            border-neutral-200
            bg-neutral-50
            p-8
            space-y-3
          "
        >

          {section.heading && (

            <h2
              className="
                text-3xl
                font-bold
                text-neutral-900
              "
            >

              {section.heading}

            </h2>

          )}

          {section.subheading && (

            <p
              className="
                text-neutral-600
                text-lg
              "
            >

              {section.subheading}

            </p>

          )}

        </div>

      ))}

      {/* EMPTY */}
      {contentSections.length === 0 && (

        <div className="py-20 text-center">

          <p className="text-gray-500">
            Content will be updated soon.
          </p>

        </div>

      )}

      {/* RENDER */}
      {contentSections.map((section, i) => {

        switch (section.type) {

          /* HEADING */
          case "heading":

            return (

              <div
                key={i}
                className="pt-10"
              >

                <h2
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-neutral-900
                    border-b
                    border-neutral-200
                    pb-3
                  "
                >

                  {section.text}

                </h2>

              </div>

            );

          /* CONTENT */
          case "content":

            return (

              <div
                key={i}
                className="space-y-4"
              >

                {section.heading && (

                  <h3 className="text-2xl font-semibold">

                    {section.heading}

                  </h3>

                )}

                <p
                  className="
                    text-neutral-700
                    leading-8
                    text-[17px]
                  "
                >

                  {section.body}

                </p>

              </div>

            );

          /* RICH TEXT */
          case "richText":

            return (

              <div
                key={i}
                className="space-y-4"
              >

                {section.heading && (

                  <h3 className="text-2xl font-semibold">

                    {section.heading}

                  </h3>

                )}

                <p
                  className="
                    text-neutral-700
                    leading-8
                    text-[17px]
                  "
                >

                  {section.content}

                </p>

              </div>

            );

          /* TIMELINE */
          case "timeline":

            return (

              <div
                key={i}
                className="space-y-6"
              >

                <h3 className="text-2xl font-bold">
                  Timeline
                </h3>

                <ul
                  className="
                    border-l-2
                    border-neutral-300
                    pl-6
                    space-y-6
                  "
                >

                  {section.events.map(
                    (event, j) => (

                      <li
                        key={j}
                        className="relative"
                      >

                        <div
                          className="
                            absolute
                            -left-[31px]
                            top-2
                            h-3
                            w-3
                            rounded-full
                            bg-black
                          "
                        />

                        <strong className="text-lg">

                          {event.year}

                        </strong>

                        <p className="text-neutral-700 mt-1">

                          {event.text}

                        </p>

                      </li>

                    )
                  )}

                </ul>

              </div>

            );

          /* NORMAL LIST */
          case "list":

            return (

              <ul
                key={i}
                className="
                  list-disc
                  pl-6
                  text-neutral-700
                  space-y-3
                "
              >

                {section.items.map(
                  (item, j) => (

                    <li
                      key={j}
                      className="leading-7"
                    >

                      {item}

                    </li>

                  )
                )}

              </ul>

            );

          /* FACULTY GRID */
          case "faculty-grid":

            return (

              <div
                key={i}
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-3
                  gap-8
                "
              >

                {section.items.map(
                  (item, j) => (

                    <Card
                      key={j}
                      item={item}
                    />

                  )
                )}

              </div>

            );

          /* EVENTS */
          case "eventList":

            return (

              <div
                key={i}
                className="space-y-5"
              >

                {section.heading && (

                  <h3 className="text-2xl font-semibold">

                    {section.heading}

                  </h3>

                )}

                {section.events.map(
                  (event, j) => (

                    <div
                      key={j}
                      className="
                        border
                        border-neutral-200
                        rounded-2xl
                        p-5
                        bg-white
                      "
                    >

                      <strong className="text-lg">

                        {event.title}

                      </strong>

                      {event.date && (

                        <div
                          className="
                            text-sm
                            text-neutral-500
                            mt-1
                          "
                        >

                          {event.date}

                        </div>

                      )}

                      {event.description && (

                        <p
                          className="
                            text-neutral-700
                            mt-3
                            leading-7
                          "
                        >

                          {event.description}

                        </p>

                      )}

                    </div>

                  )
                )}

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

