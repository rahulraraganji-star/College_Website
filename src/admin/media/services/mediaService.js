const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MEDIA_API =
  `${API_BASE}/api/media`;

const FOLDER_API =
  `${API_BASE}/api/folders`;

/* ==========================================
    Helpers
========================================== */

const request = async (
  url,
  options = {}
) => {

  const controller =
    new AbortController();

const config = {
  signal:
    options.signal ||
    controller.signal,

  credentials: "include",

  ...options,
};

  const response =
    await fetch(url, config);

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
      "Request failed."
    );

  }

  return data;

};

// RESOLVE A MEDIA ITEM'S URL AGAINST API_BASE IF IT'S RELATIVE
const resolveMediaUrl = (item) => {

  if (!item || !item.url) return item;

  const isAbsolute =
    item.url.startsWith("http://") ||
    item.url.startsWith("https://");

  if (isAbsolute) return item;

  return {
    ...item,
    url: `${API_BASE}${
      item.url.startsWith("/") ? "" : "/"
    }${item.url}`,
  };

};

const resolveMediaUrls = (items) =>
  Array.isArray(items)
    ? items.map(resolveMediaUrl)
    : items;

/* ==========================================
    Media Service
========================================== */

const mediaService = {

  /* -----------------------------
      MEDIA
  ----------------------------- */

  async getMedia(signal) {

    const data =
      await request(
        MEDIA_API,
        { signal }
      );

    return resolveMediaUrls(data.media);

  },

  async getMediaById(
    id,
    signal
  ) {

    const data =
      await request(
        `${MEDIA_API}/${id}`,
        { signal }
      );

    return resolveMediaUrl(data.media);

  },

  async uploadMedia(
    formData,
    signal
  ) {
     console.log("5");

    const data =
      await request(
        MEDIA_API,
        {

          method: "POST",

          body: formData,

          signal,

        }
      );
          console.log("6");

    return resolveMediaUrl(data.media);

  },

  async updateMedia(
    id,
    payload
  ) {

    const data =
      await request(
        `${MEDIA_API}/${id}`,
        {

          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify(
            payload
          ),

        }
      );

    return resolveMediaUrl(data.media);

  },

  async deleteMedia(id) {

    return request(
      `${MEDIA_API}/${id}`,
      {

        method: "DELETE",

      }
    );

  },


  async deleteMediaBulk(ids) {
  return request(
    `${MEDIA_API}/bulk`,
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ids,
      }),
    }
  );
},

  /* -----------------------------
      FOLDERS
  ----------------------------- */

  async getFolders(signal) {

    const data =
      await request(
        FOLDER_API,
        { signal }
      );

    return data.folders;

  },

  async getFolderTree(
    signal
  ) {

    const data =
      await request(
        `${FOLDER_API}/tree`,
        { signal }
      );

    return data.tree;

  },

  async getFolderStats(
    signal
  ) {

    const data =
      await request(
        `${FOLDER_API}/stats`,
        { signal }
      );

    return data.stats;

  },

  async getFolderMedia(
    id,
    signal
  ) {

    const data =
      await request(
        `${FOLDER_API}/${id}/media`,
        { signal }
      );

    return resolveMediaUrls(data.media);

  },

  async createFolder(
    payload
  ) {

    const data =
      await request(
        FOLDER_API,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify(
            payload
          ),

        }
      );

    return data.folder;

  },

  async updateFolder(
    id,
    payload
  ) {

    const data =
      await request(
        `${FOLDER_API}/${id}`,
        {

          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify(
            payload
          ),

        }
      );

    return data.folder;

  },

  async deleteFolder(id) {

    return request(
      `${FOLDER_API}/${id}`,
      {

        method: "DELETE",

      }
    );

  },

};

export default mediaService;