import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getMediaType,
  MEDIA_DIRECTORIES,
} from "../utils/mediaHelpers.js";

/* -----------------------------
    UPLOAD DIRECTORIES
----------------------------- */

const uploadDirectories = Object.fromEntries(
  Object.entries(MEDIA_DIRECTORIES).map(
    ([key, folder]) => [
      key,
      `uploads/media/${folder}`,
    ]
  )
);

/* -----------------------------
    STORAGE
----------------------------- */

const storage = multer.diskStorage({

  destination(req, file, cb) {

    const type = getMediaType(file.mimetype);

    const uploadPath =
      uploadDirectories[type];

    fs.mkdirSync(uploadPath, {
      recursive: true,
    });

    cb(null, uploadPath);

  },

  filename(req, file, cb) {

    const extension = path.extname(
      file.originalname
    );

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);

  },

});

/* -----------------------------
    FILE FILTER
----------------------------- */

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [

    // Images
    "image/",

    // Videos
    "video/",

    // Audio
    "audio/",

    // PDF
    "application/pdf",

    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Text files
    "text/plain",
    "text/csv",
    "application/csv",

    // Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",

  ];

  const allowed = allowedTypes.some(
    (type) => {

      if (type.endsWith("/")) {

        return file.mimetype.startsWith(type);

      }

      return file.mimetype === type;

    }
  );

  if (!allowed) {

    return cb(
      new Error("Unsupported file type."),
      false
    );

  }

  cb(null, true);

};

/* -----------------------------
    MULTER
----------------------------- */

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 50 * 1024 * 1024,

  },

});

export default upload;