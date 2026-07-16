import {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import mediaService from "../services/mediaService";

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
    REDUCER
========================================== */

function reducer(
  state,
  action
) {

  switch (action.type) {

    case "SET_LOADING":

      return {

        ...state,

        loading: action.payload,

      };

    case "SET_ERROR":

      return {

        ...state,

        error: action.payload,

      };

    case "SET_MEDIA":

      return {

        ...state,

        media: action.payload,

      };

    case "SET_FOLDERS":

      return {

        ...state,

        folders: action.payload,

      };

    case "SET_SEARCH":

      return {

        ...state,

        search: action.payload,

      };

    case "SET_FOLDER":

      return {

        ...state,

        currentFolder: action.payload,

      };

    default:

      return state;

  }

}

/* ==========================================
    HOOK
========================================== */

const useMediaLibrary = () => {

  const [state, dispatch] =
    useReducer(
      reducer,
      initialState
    );

  /* -----------------------------
      Load Library
  ----------------------------- */

  const loadLibrary =
    useCallback(async () => {

      dispatch({

        type: "SET_LOADING",

        payload: true,

      });

      dispatch({

        type: "SET_ERROR",

        payload: null,

      });

      const controller =
        new AbortController();

      try {

        const [

          media,

          folders,

        ] = await Promise.all([

          mediaService.getMedia(
            controller.signal
          ),

          mediaService.getFolders(
            controller.signal
          ),

        ]);

        dispatch({

          type: "SET_MEDIA",

          payload: media,

        });

        dispatch({

          type: "SET_FOLDERS",

          payload: folders,

        });

      } catch (error) {

        dispatch({

          type: "SET_ERROR",

          payload: error.message,

        });

      } finally {

        dispatch({

          type: "SET_LOADING",

          payload: false,

        });

      }

      return () =>
        controller.abort();

    }, []);

  /* -----------------------------
      Initial Load
  ----------------------------- */

  useEffect(() => {

    loadLibrary();

  }, [loadLibrary]);

  /* -----------------------------
      Upload
  ----------------------------- */

  const uploadMedia =
    useCallback(async (formData) => {

      await mediaService.uploadMedia(
        formData
      );

      await loadLibrary();

    }, [loadLibrary]);

  /* -----------------------------
      Delete
  ----------------------------- */

  const deleteMedia =
    useCallback(async (id) => {

      dispatch({

        type: "SET_MEDIA",

        payload: state.media.filter(
          (item) =>
            item._id !== id
        ),

      });

      try {

        await mediaService.deleteMedia(
          id
        );

      } catch (error) {

        await loadLibrary();

        throw error;

      }

    }, [state.media, loadLibrary]);

  /* -----------------------------
      Folder Actions
  ----------------------------- */

  const createFolder =
    useCallback(async (payload) => {

      await mediaService.createFolder(
        payload
      );

      await loadLibrary();

    }, [loadLibrary]);

  const updateFolder =
    useCallback(async (
      id,
      payload
    ) => {

      await mediaService.updateFolder(
        id,
        payload
      );

      await loadLibrary();

    }, [loadLibrary]);

  const deleteFolder =
    useCallback(async (id) => {

      await mediaService.deleteFolder(
        id
      );

      await loadLibrary();

    }, [loadLibrary]);

  /* -----------------------------
      Search
  ----------------------------- */

  const filteredMedia =
    useMemo(() => {

      let items =
        [...state.media];

      if (state.currentFolder) {

        items = items.filter(
          (item) =>
            item.folder?._id ===
            state.currentFolder
        );

      }

      if (state.search) {

        const query =
          state.search.toLowerCase();

        items = items.filter(
          (item) =>
            item.originalName
              ?.toLowerCase()
              .includes(query) ||

            item.alt
              ?.toLowerCase()
              .includes(query)
        );

      }

      return items;

    }, [

      state.media,

      state.search,

      state.currentFolder,

    ]);

  return {

    ...state,

    media: filteredMedia,

    loadLibrary,

    uploadMedia,

    deleteMedia,

    createFolder,

    updateFolder,

    deleteFolder,

    setSearch: (value) =>
      dispatch({

        type: "SET_SEARCH",

        payload: value,

      }),

    setCurrentFolder: (id) =>
      dispatch({

        type: "SET_FOLDER",

        payload: id,

      }),

  };

};

export default useMediaLibrary;