export const MEDIA_TYPES = {
  IMAGE: "image",
  DOCUMENT: "document",
  PDF: "pdf",
  VIDEO: "video",
  AUDIO: "audio",
  ARCHIVE: "archive",
  OTHER: "other",
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

export const ACCEPTED_ARCHIVE_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
];