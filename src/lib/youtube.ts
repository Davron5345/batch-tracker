import { createReadStream } from "fs";
import { google } from "googleapis";

export function isYoutubeConfigured(): boolean {
  return Boolean(
    process.env.YOUTUBE_CLIENT_ID &&
      process.env.YOUTUBE_CLIENT_SECRET &&
      process.env.YOUTUBE_REFRESH_TOKEN
  );
}

function getOAuthClient() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "YouTube не настроен: задайте YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN"
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

/**
 * Uploads a local video file to YouTube (unlisted by default).
 * Returns watch URL and video id. Does not change batch publicToken / QR.
 */
export async function uploadVideoToYoutube(opts: {
  filePath: string;
  title: string;
  description?: string;
}): Promise<{ videoId: string; watchUrl: string }> {
  const auth = getOAuthClient();
  const youtube = google.youtube({ version: "v3", auth });

  const privacyStatus =
    (process.env.YOUTUBE_PRIVACY_STATUS as "private" | "unlisted" | "public") ||
    "unlisted";

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: opts.title.slice(0, 100),
        description: (opts.description || "").slice(0, 5000),
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
        embeddable: true,
      },
    },
    media: {
      body: createReadStream(opts.filePath),
    },
  });

  const videoId = res.data.id;
  if (!videoId) {
    throw new Error("YouTube не вернул id видео");
  }

  return {
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/** Poll until YouTube finishes processing so embeds work */
export async function waitUntilYoutubePlayable(
  videoId: string,
  opts?: { timeoutMs?: number; intervalMs?: number }
): Promise<boolean> {
  const timeoutMs = opts?.timeoutMs ?? 10 * 60 * 1000;
  const intervalMs = opts?.intervalMs ?? 5000;
  const auth = getOAuthClient();
  const youtube = google.youtube({ version: "v3", auth });
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const res = await youtube.videos.list({
      id: [videoId],
      part: ["status", "processingDetails"],
    });
    const item = res.data.items?.[0];
    if (!item) {
      await sleep(intervalMs);
      continue;
    }

    const uploadStatus = item.status?.uploadStatus;
    const processing = item.processingDetails?.processingStatus;

    if (uploadStatus === "rejected" || uploadStatus === "failed") {
      throw new Error(`YouTube отклонил видео (${uploadStatus})`);
    }

    if (processing === "failed") {
      throw new Error("YouTube не смог обработать видео");
    }

    if (uploadStatus === "processed" || processing === "succeeded") {
      return true;
    }

    await sleep(intervalMs);
  }

  return false;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
