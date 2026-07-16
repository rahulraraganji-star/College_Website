import express from "express";

import {
  createFolder,
  getAllFolders,
  getFolderTree,
  updateFolder,
  deleteFolder,
  getFolderMedia,
  getFolderStats,
} from "../controllers/folderController.js";

const router = express.Router();

/* ==========================================
    Get Folder Tree
========================================== */

router.get(
  "/tree",
  getFolderTree
);

/* ==========================================
    Folder Statistics
========================================== */

router.get(
  "/stats",
  getFolderStats
);

/* ==========================================
    Get All Folders
========================================== */

router.get(
  "/",
  getAllFolders
);

/* ==========================================
    Create Folder
========================================== */

router.post(
  "/",
  createFolder
);

/* ==========================================
    Get Media Inside Folder
========================================== */

router.get(
  "/:id/media",
  getFolderMedia
);

/* ==========================================
    Update Folder
========================================== */

router.patch(
  "/:id",
  updateFolder
);

/* ==========================================
    Delete Folder
========================================== */

router.delete(
  "/:id",
  deleteFolder
);

/* ==========================================
    Export
========================================== */

export default router;