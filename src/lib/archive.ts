import { spawn } from "child_process";
import { access, mkdir, rename, unlink, copyFile, stat } from "fs/promises";
import path from "path";
import { constants } from "fs";
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants";

export function archiveRootDir() {
  return path.join(process.cwd(), "storage", "archive");
}

export function uploadsRootDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export function publicUploadToAbs(urlOrPath: string) {
  // urlOrPath like /uploads/foo.mp4
  const rel = urlOrPath.replace(/^\//, "");
  return path.join(process.cwd(), "public", rel);
}

async function fileExists(p: string) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `${cmd} exited ${code}`));
    });
  });
}

export async function hasFfmpeg(): Promise<boolean> {
  try {
    await run("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compresses video into storage/archive and removes the public upload original.
 * If ffmpeg is missing, copies the file into archive without re-encoding.
 */
export async function compressAndArchiveVideo(opts: {
  mediaId: string;
  localPublicPath: string;
}): Promise<{ archivePath: string; compressed: boolean }> {
  const absSrc = publicUploadToAbs(opts.localPublicPath);
  if (!(await fileExists(absSrc))) {
    throw new Error(`Локальный файл не найден: ${opts.localPublicPath}`);
  }

  const dir = archiveRootDir();
  await mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outName = `${opts.mediaId}-${stamp}.mp4`;
  const absOut = path.join(dir, outName);
  const relativeArchive = path.join("storage", "archive", outName);

  const ffmpegOk = await hasFfmpeg();
  if (ffmpegOk) {
    await run("ffmpeg", [
      "-y",
      "-i",
      absSrc,
      "-vcodec",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "medium",
      "-acodec",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      absOut,
    ]);
  } else {
    // Fallback: keep original bytes in archive (install ffmpeg for compression)
    await copyFile(absSrc, absOut);
  }

  try {
    await unlink(absSrc);
  } catch {
    // ignore
  }

  return { archivePath: relativeArchive, compressed: ffmpegOk };
}

export async function deleteArchiveFile(archivePath: string | null | undefined) {
  if (!archivePath) return;
  const abs = path.isAbsolute(archivePath)
    ? archivePath
    : path.join(process.cwd(), archivePath);
  try {
    await unlink(abs);
  } catch {
    // ignore
  }
}

export function retentionCutoff(days = ARCHIVE_RETENTION_DAYS): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function archiveFileSize(archivePath: string) {
  try {
    const abs = path.join(process.cwd(), archivePath);
    const s = await stat(abs);
    return s.size;
  } catch {
    return null;
  }
}

/** Move without compression (unused helper for retries). */
export async function moveToArchiveRaw(mediaId: string, localPublicPath: string) {
  const absSrc = publicUploadToAbs(localPublicPath);
  const dir = archiveRootDir();
  await mkdir(dir, { recursive: true });
  const outName = `${mediaId}-${Date.now()}${path.extname(absSrc) || ".mp4"}`;
  const absOut = path.join(dir, outName);
  await rename(absSrc, absOut).catch(async () => {
    await copyFile(absSrc, absOut);
    await unlink(absSrc);
  });
  return path.join("storage", "archive", outName);
}
