import {
  MEDIA_TYPES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_ARCHIVE_TYPES,
} from "../constants/mediaTypes";

export const getMediaType = (mimeType) => {

  if (ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.IMAGE;
  }

  if (mimeType === "application/pdf") {
    return MEDIA_TYPES.PDF;
  }

  if (ACCEPTED_DOCUMENT_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.DOCUMENT;
  }

  if (ACCEPTED_VIDEO_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.VIDEO;
  }

  if (ACCEPTED_AUDIO_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.AUDIO;
  }

  if (ACCEPTED_ARCHIVE_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.ARCHIVE;
  }

  return MEDIA_TYPES.OTHER;

};

export const formatFileSize = (bytes) => {

  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];

  let size = bytes;

  let index = 0;

  while (size >= 1024 && index < units.length - 1) {

    size /= 1024;

    index++;

  }

  return `${size.toFixed(1)} ${units[index]}`;

};