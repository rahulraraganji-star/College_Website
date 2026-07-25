import path from "path";

/* -----------------------------
    DETERMINE MEDIA TYPE
----------------------------- */

export const getMediaType = (mimeType) => {

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType === "application/pdf") {
  return "document";
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
    MEDIA DIRECTORIES
----------------------------- */

export const MEDIA_DIRECTORIES = {
  image: "images",
  document: "documents",
  pdf: "documents",
  video: "videos",
  audio: "audio",
  archive: "archives",
  other: "others",
};

/* -----------------------------
    FILE EXTENSION
----------------------------- */

export const getExtension = (filename) => {

  return path.extname(filename)
    .replace(".", "")
    .toLowerCase();

};

/* -----------------------------
    FORMAT FILE SIZE
----------------------------- */

export const formatFileSize = (bytes) => {

  if (!bytes) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  let size = bytes;

  let index = 0;

  while (
    size >= 1024 &&
    index < units.length - 1
  ) {

    size /= 1024;

    index++;

  }

  return `${size.toFixed(1)} ${units[index]}`;

};

/* -----------------------------
    IMAGE CHECK
----------------------------- */

export const isImage = (mimeType) => {

  return mimeType.startsWith("image/");

};

/* -----------------------------
    DOCUMENT CHECK
----------------------------- */

export const isDocument = (mimeType) => {

  return (
    mimeType === "application/pdf" ||

    mimeType.includes("word") ||

    mimeType.includes("excel") ||

    mimeType.includes("powerpoint") ||

    mimeType.startsWith("text/")
  );

};

/* -----------------------------
    VIDEO CHECK
----------------------------- */

export const isVideo = (mimeType) => {

  return mimeType.startsWith("video/");

};

/* -----------------------------
    AUDIO CHECK
----------------------------- */

export const isAudio = (mimeType) => {

  return mimeType.startsWith("audio/");

};

/* -----------------------------
    PARSE TAGS
----------------------------- */

export const parseTags = (value) => {

  if (!value) return [];

  if (Array.isArray(value)) {

    return value;

  }

  try {

    return JSON.parse(value);

  } catch {

    return [];

  }

};