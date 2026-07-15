import multer from "multer";
import path from "path";
import fs from "fs";

/* -----------------------------
    UPLOAD DIRECTORIES
----------------------------- */

const uploadDirectories = {
  image: "uploads/media/images",
  document: "uploads/media/documents",
  pdf: "uploads/media/documents",
  video: "uploads/media/videos",
  audio: "uploads/media/audio",
  archive: "uploads/media/archives",
  other: "uploads/media/others",
};

/* -----------------------------
    DETERMINE MEDIA TYPE
----------------------------- */

const getMediaType = (mimeType) => {

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("powerpoint") ||
    mimeType.startsWith("text/")
  ) {
    return "document";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar")
  ) {
    return "archive";
  }

  return "other";

};

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

    "image/",

    "video/",

    "audio/",

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "application/zip",

    "application/x-rar-compressed",

    "text/plain",

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

    fileSize:
      50 * 1024 * 1024,

  },

});

export default upload;