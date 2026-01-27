export const hasRenderableSection = (sections = []) => {
  return sections.some((section) => {
    switch (section.type) {
      case "content":
        return Boolean(section.body?.trim());

      case "richText":
        return Boolean(section.content?.trim());

      case "list":
        return Array.isArray(section.items) && section.items.length > 0;

      case "timeline":
        return Array.isArray(section.events) && section.events.length > 0;

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

      default:
        return false;
    }
  });
};
