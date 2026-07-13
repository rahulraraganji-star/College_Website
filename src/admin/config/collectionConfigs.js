export const collectionConfigs = {
  list: {
    title: "List",
    icon: "📋",
    collectionKey: "items",

    fields: [
      {
        key: "text",
        label: "Item",
        type: "text",
      },
    ],
  },

  timeline: {
    title: "Timeline",
    icon: "🕒",
    collectionKey: "events",

    fields: [
      {
        key: "year",
        label: "Year",
        type: "text",
      },
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
    ],
  },

  documentList: {
    title: "Documents",
    icon: "📑",
    collectionKey: "documents",

    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "file",
        label: "PDF",
        type: "file",
      },
    ],
  },

  eventList: {
    title: "Events",
    icon: "🎉",
    collectionKey: "events",

    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "date",
        label: "Date",
        type: "date",
      },
      {
        key: "location",
        label: "Location",
        type: "text",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "buttonText",
        label: "Button Text",
        type: "text",
      },
      {
        key: "buttonLink",
        label: "Button Link",
        type: "text",
      },
    ],
  },
};