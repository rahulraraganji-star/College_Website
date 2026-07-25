export const collectionConfigs = {
  list: {
    title: "List",
    icon: "📋",
    collectionKey: "items",
    addButtonLabel: "Item",

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
    addButtonLabel: "Timeline Item",

    fields: [
      {
        key: "image",
        label: "Image",
        type: "image",
      },
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
    addButtonLabel: "Document",

    fields: [
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
      {
        key: "category",
        label: "Category",
        type: "select",
        options: [
          "Academic",
          "Admissions",
          "Examinations",
          "Circulars",
          "Forms",
          "Notices",
          "Others",
        ],
      },
      {
        key: "file",
        label: "Document",
        type: "file",
      },
    ],
  },

  eventList: {
    title: "Events",
    icon: "📅",
    collectionKey: "events",
    addButtonLabel: "Event",

    fields: [
      {
        key: "images",
        label: "Event Gallery",
        type: "images",
      },
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
        key: "category",
        label: "Category",
        type: "text",
      },
      {
        key: "description",
        label: "Short Description",
        type: "textarea",
      },
      {
        key: "fullDescription",
        label: "Full Description",
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

  gallery: {
    title: "Gallery",
    icon: "🖼️",
    collectionKey: "images",
    addButtonLabel: "Image",

    fields: [
      {
        key: "images",
        label: "Gallery Images",
        type: "images",
      },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          "grid",
          "slider",
          "masonry",
        ],
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

  // You can add more collection types here
  // For example:
  // team: {
  //   title: "Team Members",
  //   icon: "👥",
  //   collectionKey: "members",
  //   addButtonLabel: "Member",
  //   
  //   fields: [
  //     {
  //       key: "image",
  //       label: "Photo",
  //       type: "image",
  //     },
  //     {
  //       key: "name",
  //       label: "Name",
  //       type: "text",
  //     },
  //     {
  //       key: "position",
  //       label: "Position",
  //       type: "text",
  //     },
  //     {
  //       key: "bio",
  //       label: "Bio",
  //       type: "textarea",
  //     },
  //     {
  //       key: "email",
  //       label: "Email",
  //       type: "text",
  //     },
  //   ],
  // },
};