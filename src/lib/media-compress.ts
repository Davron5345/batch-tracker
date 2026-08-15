import { spawn } from "child_process";
import { mkdir, unlink, writeFile, rename, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { uploadsAbsDir } from "@/lib/storage-paths";

const IMAGE_JPEG_QUALITY = 82;
const VIDEO_MAX_HEIGHT = 720;
const VIDEO_CRF = 28;

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
      else reject(new Error(stderr.slice(-800) || `${cmd} exited ${code}`));
    });
  });
}

export async function hasFfmpegBinary(): Promise<boolean> {
  try {
    await run("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

export type CompressResult = {
  filename: string;
  absPath: string;
  bytesIn: number;
  bytesOut: number;
  compressed: boolean;
};

/** Compress photo → JPEG, keep full frame (no crop / no forced resize). */
export async function compressAndSaveImage(
  input: Buffer,
  baseName: string
): Promise<CompressResult> {
  const dir = uploadsAbsDir();
  await mkdir(dir, { recursive: true });
  const filename = `${baseName}.jpg`;
  const absPath = path.join(dir, filename);

  // rotate() only applies EXIF orientation — does not crop
  const out = await sharp(input, { failOn: "none" })
    .rotate()
    .jpeg({ quality: IMAGE_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  await writeFile(absPath, out);

  return {
    filename,
    absPath,
    bytesIn: input.length,
    bytesOut: out.length,
    compressed: out.length < input.length,
  };
}

/**
 * Compress video with ffmpeg → H.264 MP4 ≤720p.
 * Falls back to saving the original if ffmpeg is missing or fails.
 */
export async function compressAndSaveVideo(
  input: Buffer,
  baseName: string,
  originalExt: string
): Promise<CompressResult> {
  const dir = uploadsAbsDir();
  await mkdir(dir, { recursive: true });
  const safeExt =
    originalExt && originalExt.startsWith(".") ? originalExt : ".mp4";

  const ffmpegOk = await hasFfmpegBinary();
  if (!ffmpegOk) {
    const filename = `${baseName}${safeExt}`;
    const absPath = path.join(dir, filename);
    await writeFile(absPath, input);
    return {
      filename,
      absPath,
      bytesIn: input.length,
      bytesOut: input.length,
      compressed: false,
    };
  }

  const tmpIn = path.join(dir, `.tmp-${baseName}-in${safeExt}`);
  const filename = `${baseName}.mp4`;
  const absPath = path.join(dir, filename);
  const tmpOut = path.join(dir, `.tmp-${baseName}-out.mp4`);

  try {
    await writeFile(tmpIn, input);
    await run("ffmpeg", [
      "-y",
      "-i",
      tmpIn,
      "-vf",
      `scale=-2:'min(${VIDEO_MAX_HEIGHT},ih)'`,
      "-c:v",
      "libx264",
      "-crf",
      String(VIDEO_CRF),
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      tmpOut,
    ]);

    const outStat = await stat(tmpOut);
    await rename(tmpOut, absPath);

    return {
      filename,
      absPath,
      bytesIn: input.length,
      bytesOut: outStat.size,
      compressed: outStat.size < input.length,
    };
  } catch (err) {
    console.error("[compress-video]", err);
    const filenameRaw = `${baseName}${safeExt}`;
    const absRaw = path.join(dir, filenameRaw);
    await writeFile(absRaw, input);
    return {
      filename: filenameRaw,
      absPath: absRaw,
      bytesIn: input.length,
      bytesOut: input.length,
      compressed: false,
    };
  } finally {
    await unlink(tmpIn).catch(() => undefined);
    await unlink(tmpOut).catch(() => undefined);
  }
}
