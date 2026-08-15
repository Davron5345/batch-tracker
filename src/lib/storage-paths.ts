import path from "path";

/**
 * Persistent data root.
 * On Railway mount a volume at /data and set DATA_DIR=/data
 * (or rely on RAILWAY_VOLUME_MOUNT_PATH).
 */
export function dataRoot() {
  return (
    process.env.DATA_DIR ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH ||
    path.join(process.cwd(), "storage")
  );
}

export function uploadsAbsDir() {
  return path.join(dataRoot(), "uploads");
}

export function archiveAbsDir() {
  return path.join(dataRoot(), "archive");
}

/** Public URL path stored in DB, e.g. /uploads/foo.jpg */
export function uploadPublicPath(filename: string) {
  return `/uploads/${filename}`;
}

export function isUploadPublicPath(p: string | null | undefined): p is string {
  return Boolean(p && p.startsWith("/uploads/") && !p.includes(".."));
}

export function uploadFilenameFromPublicPath(publicPath: string) {
  return publicPath.replace(/^\/uploads\//, "").replace(/^\/+/, "");
}

export function resolveUploadAbs(publicOrRel: string) {
  const filename = uploadFilenameFromPublicPath(publicOrRel);
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new Error("Некорректный путь загруженного файла");
  }
  return path.join(uploadsAbsDir(), filename);
}

export function resolveArchiveAbs(archivePath: string) {
  if (path.isAbsolute(archivePath)) return archivePath;
  const base = path.basename(archivePath);
  // Prefer volume archive dir; fall back to legacy cwd-relative path
  return path.join(archiveAbsDir(), base);
}
