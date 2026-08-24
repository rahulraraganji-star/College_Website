import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import mediaService from "../services/mediaService";

/* ==========================================
    ACTION TYPES
========================================== */

const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_MEDIA: "SET_MEDIA",
  SET_FOLDERS: "SET_FOLDERS",
  SET_SEARCH: "SET_SEARCH",
  SET_FOLDER: "SET_FOLDER",
  REMOVE_MEDIA: "REMOVE_MEDIA",
};

/* ==========================================
    INITIAL STATE
========================================== */

const initialState = {
  media: [],
  folders: [],
  loading: true,
  error: null,
  search: "",
  currentFolder: null,
};

/* ==========================================
    HELPERS
========================================== */

/**
 * Returns the id of a media item's folder, whether `folder` is
 * populated as an object ({ _id }) or stored as a raw ObjectId/string.
 */
function getFolderId(folder) {
  if (!folder) return null;
  return typeof folder === "object" ? folder._id : folder;
}

/**
 * Extracts a human-readable error message from a thrown error,
 * preferring API-provided messages over generic ones.
 */
function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong."
  );
}

/* ==========================================
    REDUCER
========================================== */

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ACTIONS.SET_MEDIA:
      return {
        ...state,
        media: action.payload,
      };

    case ACTIONS.SET_FOLDERS:
      return {
        ...state,
        folders: action.payload,
      };

    case ACTIONS.SET_SEARCH:
      return {
        ...state,
        search: action.payload,
      };

    case ACTIONS.SET_FOLDER:
      return {
        ...state,
        currentFolder: action.payload,
      };

    case ACTIONS.REMOVE_MEDIA:
      return {
        ...state,
        media: state.media.filter(
          (item) => item._id !== action.payload
        ),
      };

    default:
      return state;
  }
}

/* ==========================================
    HOOK
========================================== */

/**
 * useMediaLibrary
 *
 * Owns media/folder state for the media library and exposes the
 * actions needed to drive it (fetching, uploading, deleting,
 * folder CRUD, search, and folder navigation).
 *
 * Every mutating action (upload/create/update/delete) re-fetches
 * the library afterward so `media` and `folders` stay in sync with
 * the server. `deleteMedia` also applies an optimistic local update
 * so the UI feels instant, and rolls back via a re-fetch if the
 * request fails.
 */
const useMediaLibrary = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Tracks the in-flight load request so a new load can cancel a
  // stale one, and so unmount can cancel whatever is still pending.
  const abortControllerRef = useRef(null);

  /* -----------------------------
      Load Library
  ----------------------------- */

  const loadLibrary = useCallback(async () => {
    // Cancel any previous in-flight load before starting a new one.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });

    try {
      const [media, folders] = await Promise.all([
        mediaService.getMedia(controller.signal),
        mediaService.getFolders(controller.signal),
      ]);

      dispatch({ type: ACTIONS.SET_MEDIA, payload: media });
      dispatch({ type: ACTIONS.SET_FOLDERS, payload: folders });
    } catch (error) {
      // Ignore errors from a request we intentionally aborted.
      if (error?.name === "AbortError") return;

      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorMessage(error),
      });
    } finally {
      if (abortControllerRef.current === controller) {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    }
  }, []);

  /* -----------------------------
      Initial Load / Cleanup
  ----------------------------- */

  useEffect(() => {
    loadLibrary();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadLibrary]);

  /**
   * Uploads a new media file and refreshes the library.
   * @param {FormData} formData
   */
  const uploadMedia = useCallback(
    async (formData) => {
      try {
        await mediaService.uploadMedia(formData);
        await loadLibrary();
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: getErrorMessage(error),
        });
        throw error;
      }
    },
    [loadLibrary]
  );

  /**
   * Deletes a media item. Applies an optimistic local removal, then
   * rolls back with a fresh load if the server request fails.
   * @param {string} id
   */
  const deleteMedia = useCallback(
    async (id) => {
      dispatch({ type: ACTIONS.REMOVE_MEDIA, payload: id });

      try {
        await mediaService.deleteMedia(id);
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: getErrorMessage(error),
        });
        await loadLibrary();
        throw error;
      }
    },
    [loadLibrary]
  );

/**bulk media delete */
  const deleteMediaBulk = useCallback(
  async (ids) => {
    try {
      const result = await mediaService.deleteMediaBulk(ids);

      await loadLibrary();

      return result;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorMessage(error),
      });

      throw error;
    }
  },
  [loadLibrary]
);

  /* -----------------------------
      Folder Actions
  ----------------------------- */

  /**
   * Creates a new folder and refreshes the library.
   * @param {object} payload
   */
  const createFolder = useCallback(
    async (payload) => {
      try {
        await mediaService.createFolder(payload);
        await loadLibrary();
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: getErrorMessage(error),
        });
        throw error;
      }
    },
    [loadLibrary]
  );

  /**
   * Updates an existing folder and refreshes the library.
   * @param {string} id
   * @param {object} payload
   */
  const updateFolder = useCallback(
    async (id, payload) => {
      try {
        await mediaService.updateFolder(id, payload);
        await loadLibrary();
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: getErrorMessage(error),
        });
        throw error;
      }
    },
    [loadLibrary]
  );

  /**
   * Deletes a folder and refreshes the library.
   * @param {string} id
   */
  const deleteFolder = useCallback(
    async (id) => {
      try {
        await mediaService.deleteFolder(id);
        await loadLibrary();
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: getErrorMessage(error),
        });
        throw error;
      }
    },
    [loadLibrary]
  );

  /* -----------------------------
      Search / Filtering
  ----------------------------- */

 const filteredMedia = useMemo(() => {
  let items = [...state.media];

  if (state.currentFolder) {
    items = items.filter(
      (item) =>
        getFolderId(item.folder) ===
        state.currentFolder.toString()
    );
  }

  if (state.search) {
    const query = state.search.toLowerCase();

    items = items.filter(
      (item) =>
        item.originalName?.toLowerCase().includes(query) ||
        item.alt?.toLowerCase().includes(query) ||
        item.filename?.toLowerCase().includes(query) ||
        item.mimeType?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query)
    );
  }

  return items;
}, [state.media, state.search, state.currentFolder]);

  /* -----------------------------
      Lookup Helpers
  ----------------------------- */

  /**
   * Finds a media item (from the unfiltered set) by id.
   * @param {string} id
   */
  const getMediaById = useCallback(
    (id) => state.media.find((item) => item._id === id),
    [state.media]
  );

  /**
   * Finds a folder by id.
   * @param {string} id
   */
  const getFolderById = useCallback(
    (id) => state.folders.find((folder) => folder._id === id),
    [state.folders]
  );

  return {
    ...state,
    media: filteredMedia,

    loadLibrary,
    uploadMedia,
    deleteMedia,
    deleteMediaBulk,
    createFolder,
    updateFolder,
    deleteFolder,

    getMediaById,
    getFolderById,

    setSearch: (value) =>
      dispatch({ type: ACTIONS.SET_SEARCH, payload: value }),

    setCurrentFolder: (id) =>
      dispatch({ type: ACTIONS.SET_FOLDER, payload: id }),
  };
};

export default useMediaLibrary;