export const collectionConfigs = {
  // ✅ Scrolling Text/Marquee
  list: {
  title: "Scrolling Text",
  icon: "📢",
  collectionKey: "items",
  addButtonLabel: "Message",

  fields: [
    {
      key: "text",
      label: "Text",
      type: "text",
    },
    {
      key: "font",
      label: "Font",
      type: "text",
      showIn: ["homepage"],
    },
  ],
},

  // ✅ Timeline
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

  // ✅ Documents
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

  // ✅ Event List (for events page)
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

  // ✅ Learning Spaces
  learningSpaces: {
    title: "Learning Spaces",
    icon: "🏫",
    collectionKey: "slides",
    addButtonLabel: "Slide",

    fields: [
      {
        key: "image",
        label: "Image",
        type: "image",
      },
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "desc",
        label: "Description",
        type: "textarea",
      },
    ],
  },

  // ✅ Homepage Events (matches MongoDB eventsSection)
  eventsSection: {
    title: "Home Events",
    icon: "📅",
    collectionKey: "events",
    addButtonLabel: "Event",

    fields: [
      {
        key: "image",
        label: "Image",
        type: "image",
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
      {
        key: "department",
        label: "Department",
        type: "text",
      },
      {
        key: "location",
        label: "Location",
        type: "text",
      },
      {
        key: "updated",
        label: "Updated",
        type: "text",
      },
    ],
  },

  // ✅ Core Strengths (matches MongoDB stats)
  coreStrengths: {
    title: "Core Strengths",
    icon: "⭐",
    collectionKey: "stats",
    addButtonLabel: "Stat",

    fields: [
      {
        key: "icon",
        label: "Icon Name",
        type: "text",
      },
      {
        key: "value",
        label: "Value",
        type: "text",
      },
      {
        key: "label",
        label: "Label",
        type: "text",
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