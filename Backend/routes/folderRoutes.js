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

import { requireAuth } from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   VIEW FOLDERS
========================================== */


/* Folder tree */

router.get(
  "/tree",
  requireAuth,
  requirePermission("media.view"),
  getFolderTree
);


/* Folder statistics */

router.get(
  "/stats",
  requireAuth,
  requirePermission("media.view"),
  getFolderStats
);


/* All folders */

router.get(
  "/",
  requireAuth,
  requirePermission("media.view"),
  getAllFolders
);


/* Media inside folder */

router.get(
  "/:id/media",
  requireAuth,
  requirePermission("media.view"),
  getFolderMedia
);


/* ==========================================
   CREATE FOLDER
========================================== */


/*
   Creating a folder changes the media
   library structure, so we use media.edit.
*/

router.post(
  "/",
  requireAuth,
  requirePermission("media.edit"),
  createFolder
);


/* ==========================================
   UPDATE FOLDER
========================================== */

router.patch(
  "/:id",
  requireAuth,
  requirePermission("media.edit"),
  updateFolder
);


/* ==========================================
   DELETE FOLDER
========================================== */

router.delete(
  "/:id",
  requireAuth,
  requirePermission("media.delete"),
  deleteFolder
);


export default router;