import express from "express";

import upload from "../middleware/upload.js";

import {
  uploadMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from "../controllers/mediaController.js";

const router = express.Router();

/* ==========================================
    Upload Media
========================================== */

router.post(
  "/",
  upload.single("file"),
  uploadMedia
);

/* ==========================================
    Get All Media
========================================== */

router.get(
  "/",
  getAllMedia
);

/* ==========================================
    Get Single Media
========================================== */

router.get(
  "/:id",
  getMediaById
);

/* ==========================================
    Update Media
========================================== */

router.patch(
  "/:id",
  updateMedia
);

/* ==========================================
    Delete Media
========================================== */

router.delete(
  "/:id",
  deleteMedia
);

/* ==========================================
    Export
========================================== */

export default router;