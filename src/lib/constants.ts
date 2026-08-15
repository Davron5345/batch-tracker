export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const MediaType = {
  photo: "photo",
  video: "video",
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const MediaSource = {
  upload: "upload",
  youtube: "youtube",
} as const;

export type MediaSource = (typeof MediaSource)[keyof typeof MediaSource];

/** Video pipeline after local upload → YouTube → archive */
export const MediaPipelineStatus = {
  none: "none",
  pending_youtube: "pending_youtube",
  uploading_youtube: "uploading_youtube",
  /** Uploaded to YouTube, waiting until YouTube finishes processing (embeddable) */
  processing_youtube: "processing_youtube",
  pending_archive: "pending_archive",
  archiving: "archiving",
  archived: "archived",
  youtube_failed: "youtube_failed",
  archive_failed: "archive_failed",
  youtube_skipped: "youtube_skipped",
} as const;

export type MediaPipelineStatus =
  (typeof MediaPipelineStatus)[keyof typeof MediaPipelineStatus];

export const ARCHIVE_RETENTION_DAYS = 90;

export const BatchStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];

export const ALL_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EDITOR,
  Role.VIEWER,
];
