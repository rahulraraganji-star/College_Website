import express from "express";

import upload from "../middleware/upload.js";

import {
  uploadMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  deleteMediaBulk,
} from "../controllers/mediaController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

import {
  requirePermission,
} from "../middleware/permissionMiddleware.js";


const router = express.Router();


/* ==========================================
   VIEW MEDIA
========================================== */


/* Get all media */

router.get(
  "/",
  requireAuth,
  requirePermission("media.view"),
  getAllMedia
);


/* Get single media */

router.get(
  "/:id",
  requireAuth,
  requirePermission("media.view"),
  getMediaById
);


/* ==========================================
   UPLOAD MEDIA
========================================== */


/* Upload media */

router.post(
  "/",
  requireAuth,
  requirePermission("media.upload"),
  upload.single("file"),
  uploadMedia
);


/* ==========================================
   EDIT MEDIA
========================================== */


/* Update media */

router.patch(
  "/:id",
  requireAuth,
  requirePermission("media.edit"),
  updateMedia
);


/* ==========================================
   DELETE MEDIA
========================================== */


/* Bulk delete */

router.delete(
  "/bulk",
  requireAuth,
  requirePermission("media.delete"),
  deleteMediaBulk
);


/* Delete single media */

router.delete(
  "/:id",
  requireAuth,
  requirePermission("media.delete"),
  deleteMedia
);


export default router;