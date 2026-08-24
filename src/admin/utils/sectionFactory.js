// ==========================================
// ID GENERATOR
// ==========================================

const generateSectionId = () => {
  return `section_${crypto.randomUUID()}`;
};

export const createSection = (type) => {
  switch (type) {
    case "hero":
      return {
        id: generateSectionId(),
        type: "hero",
        heading: "",
        subheading: "",
        background: null,
        height: "medium",
        alignment: "center",
        overlay: 40,
        primaryButtonText: "",
        primaryButtonLink: "",
        secondaryButtonText: "",
        secondaryButtonLink: "",
      };

    case "heading":
      return {
        id: generateSectionId(),
        type: "heading",
        text: "",
        level: "h2",
        alignment: "left",
      };

    case "richText":
      return {
        id: generateSectionId(),
        type: "richText",
        heading: "",
        content: "",
      };

    case "list":
      return {
        id: generateSectionId(),
        type: "list",
        title: "",
        items: [],
      };

    case "faculty-grid":
      return {
        id: generateSectionId(),
        type: "faculty-grid",
        title: "",
        departments: []
      };

    case "gallery":
      return {
        id: generateSectionId(),
        type: "gallery",
        title: "",
        galleries: [],
      };

    case "documentList":
      return {
        id: generateSectionId(),
        type: "documentList",
        title: "",
        documents: [],
      };

    case "table":
      return {
        id: generateSectionId(),
        type: "table",
        title: "",
        headers: [],
        rows: [],
      };

    case "timeline":
      return {
        id: generateSectionId(),
        type: "timeline",
        title: "",
        events: [],
      };

    case "eventList":
      return {
        id: generateSectionId(),
        type: "eventList",
        title: "",
        events: [],
      };

    case "embed":
      return {
        id: generateSectionId(),
        type: "embed",
        title: "",
        embedType: "iframe",
        url: "",
        media: null,
        height: 500,
        width: "100%",
        allowFullscreen: true,
        lazyLoad: true,
        responsive: true,
      };

    default:
      return null;
  }
};