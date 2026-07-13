export const createSection = (type) => {

  switch (type) {

    case "hero":

      return {
        type: "hero",

        heading: "",
        subheading: "",

        backgroundImage: "",

        height: "medium",

        alignment: "center",

        overlay: 40,

        buttonText: "",
        buttonLink: "",
      };

    case "heading":

      return {
        type: "heading",

        text: "",

        level: "h2",

        alignment: "left",
      };

    case "richText":

      return {
        type: "richText",

        heading: "",

        content: "",
      };

    case "list":

      return {
        type: "list",

        title: "",

        items: [],
      };

    case "faculty-grid":

  return {

    type: "faculty-grid",

    title: "",

    departments: []

  };

    case "gallery":

      return {
        type: "gallery",

        title: "",

        layout: "grid",

        columns: 3,

        images: [],
      };

    case "documentList":

      return {
        type: "documentList",

        title: "",

        documents: [],
      };

    case "table":

      return {
        type: "table",

        title: "",

        headers: [],

        rows: [],
      };

    case "timeline":

      return {
        type: "timeline",

        title: "",

        events: [],
      };

    case "eventList":

      return {
        type: "eventList",

        title: "",

        events: [],
      };

    case "embed":

      return {
        type: "embed",

        title: "",

        url: "",

        height: 500,
      };

    default:

      return null;

  }

};