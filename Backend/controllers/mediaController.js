import fs from "fs";
import path from "path";

import Media from "../models/Media.js";
import Folder from "../models/Folder.js";

import {
  getMediaType,
  getExtension,
  parseTags,
  MEDIA_DIRECTORIES,
} from "../utils/mediaHelpers.js";

/* ==========================================
    Upload Media
========================================== */

export const uploadMedia = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });

    }

    const file = req.file;

    const type = getMediaType(file.mimetype);

    if (req.body.folder) {

      const folder = await Folder.findById(
        req.body.folder
      );

      if (!folder) {

        return res.status(400).json({
          success: false,
          message: "Folder not found.",
        });

      }

    }

    const media = await Media.create({

      filename: file.filename,

      originalName:
        file.originalname,

      url: `/uploads/media/${MEDIA_DIRECTORIES[type]}/${file.filename}`,

      type,

      mimeType: file.mimetype,

      extension: getExtension(
        file.originalname
      ),

      size: file.size,

      // TODO:
      // Replace with Sharp metadata extraction.

      width: req.body.width || null,

      height:
        req.body.height || null,

      alt: req.body.alt || "",

      folder:
        req.body.folder || null,

      tags: parseTags(req.body.tags),

    });

    const populatedMedia =
      await Media.findById(media._id)
        .populate("folder", "name slug");

    res.status(201).json({

      success: true,

      message: "Media uploaded successfully.",

      media: populatedMedia,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to upload media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Get All Media
========================================== */

export const getAllMedia = async (
  req,
  res
) => {

  try {

    const media =
      await Media.find()

        .populate(
          "folder",
          "name slug"
        )

        .sort({
          createdAt: -1,
        });

    res.json({

      success: true,

      count: media.length,

      media,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};
/* ==========================================
    Get Single Media
========================================== */

export const getMediaById = async (
  req,
  res
) => {

  try {

    const media = await Media.findById(
      req.params.id
    ).populate(
      "folder",
      "name slug"
    );

    if (!media) {

      return res.status(404).json({

        success: false,

        message: "Media not found.",

      });

    }

    res.json({

      success: true,

      media,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Failed to fetch media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Update Media
========================================== */

export const updateMedia = async (
  req,
  res
) => {

  try {

    const media =
      await Media.findById(
        req.params.id
      );

    if (!media) {

      return res.status(404).json({

        success: false,

        message: "Media not found.",

      });

    }

    media.alt =
      req.body.alt ??
      media.alt;

    if (req.body.folder !== undefined) {

      if (req.body.folder) {

        const folder = await Folder.findById(
          req.body.folder
        );

        if (!folder) {

          return res.status(400).json({

            success: false,

            message: "Folder not found.",

          });

        }

      }

      media.folder = req.body.folder || null;

    }

    if (req.body.tags !== undefined) {

      media.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : parseTags(req.body.tags);

    }

    await media.save();

    const updatedMedia =
      await Media.findById(media._id)
        .populate("folder", "name slug");

    res.json({

      success: true,

      message:
        "Media updated successfully.",

      media: updatedMedia,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to update media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Delete Media
========================================== */

export const deleteMedia = async (
  req,
  res
) => {

  try {

    const media =
      await Media.findById(
        req.params.id
      );

    if (!media) {

      return res.status(404).json({

        success: false,

        message: "Media not found.",

      });

    }

    const filePath = path.join(
      process.cwd(),
      media.url.replace(/^\//, "")
    );

    try {

      await fs.promises.unlink(filePath);

    } catch (err) {

      if (err.code !== "ENOENT") {

        throw err;

      }

    }

    await media.deleteOne();

    res.json({

      success: true,

      message:
        "Media deleted successfully.",

      deletedId: req.params.id,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to delete media.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }

};

/* ==========================================
    Bulk Delete Media
========================================== */

export const deleteMediaBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Media IDs are required.",
      });
    }

    const mediaItems = await Media.find({
      _id: { $in: ids },
    });

    if (!mediaItems.length) {
      return res.status(404).json({
        success: false,
        message: "No media items found.",
      });
    }

    let deletedFiles = 0;

    for (const media of mediaItems) {
      const filePath = path.join(
        process.cwd(),
        media.url.replace(/^\//, "")
      );

      try {
        await fs.promises.unlink(filePath);
        deletedFiles++;
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(
            `Failed to delete file: ${media.url}`,
            err
          );
        }
      }
    }

    const result = await Media.deleteMany({
      _id: { $in: ids },
    });

    return res.json({
      success: true,
      message: "Media deleted successfully.",
      deletedCount: result.deletedCount,
      deletedFiles,
    });
  } catch (error) {
    console.error("BULK MEDIA DELETE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete media.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};