"use client";

import { youtubeEmbedUrl, isYoutubePipelineBusy } from "@/lib/utils";

export type BatchVideoItem = {
  id: string;
  source: string;
  urlOrPath: string;
  caption?: string | null;
  pipelineStatus?: string | null;
  pipelineError?: string | null;
  youtubeVideoId?: string | null;
  /** Local /uploads path kept until 90-day archive */
  localPath?: string | null;
};

type Props = {
  video: BatchVideoItem;
  title?: string;
  /** Compact height for admin grid */
  compact?: boolean;
  uploadingLabel?: string;
  failedLabel?: string;
};

function localPlaybackUrl(video: BatchVideoItem): string | null {
  const candidates = [video.localPath, video.urlOrPath];
  for (const c of candidates) {
    if (c && c.startsWith("/uploads/")) return c;
  }
  return null;
}

export function BatchVideoPlayer({
  video,
  title,
  compact,
  uploadingLabel = "В фоне: загрузка на YouTube…",
  failedLabel = "Не удалось загрузить на YouTube",
}: Props) {
  const embed = youtubeEmbedUrl(video.urlOrPath, video.youtubeVideoId);
  const localSrc = localPlaybackUrl(video);
  const busy = isYoutubePipelineBusy(video.pipelineStatus);
  const failed =
    video.pipelineStatus === "youtube_failed" ||
    video.pipelineStatus === "youtube_skipped";
  const frameClass =
    "relative aspect-video w-full overflow-hidden bg-black" +
    (compact ? "" : "");

  // YouTube ready → switch from our server file immediately
  if (embed) {
    return (
      <div className={frameClass}>
        <iframe
          src={embed}
          className="absolute inset-0 h-full w-full"
          title={title || video.caption || "YouTube"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Play from our server right away; snake is only a background-upload hint
  if (localSrc) {
    return (
      <div className={frameClass}>
        <video
          src={localSrc}
          controls
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload="metadata"
        />
        {busy && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="yt-snake-track" aria-hidden>
              <span className="yt-snake-bar" />
              <span className="yt-snake-bar yt-snake-bar--delayed" />
            </div>
            <p className="mt-2 px-3 text-center text-[11px] font-semibold tracking-wide text-white/90 drop-shadow">
              {uploadingLabel}
            </p>
          </div>
        )}
        {failed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
            {video.pipelineError || failedLabel}
          </div>
        )}
      </div>
    );
  }

  if (busy) {
    return (
      <div className={frameClass} role="status" aria-live="polite">
        <YoutubeSnakeLoading label={uploadingLabel} />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <YoutubeSnakeLoading label={failed ? failedLabel : uploadingLabel} staticBar={failed} />
    </div>
  );
}

function YoutubeSnakeLoading({
  label,
  staticBar,
}: {
  label: string;
  staticBar?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]">
      <div
        className={`yt-snake-track ${staticBar ? "yt-snake-track--static" : ""}`}
        aria-hidden
      >
        <span className="yt-snake-bar" />
        <span className="yt-snake-bar yt-snake-bar--delayed" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/youtube.png"
        alt=""
        width={120}
        height={120}
        className="h-16 w-16 object-contain opacity-95 sm:h-20 sm:w-20"
      />
      <p className="mt-4 max-w-[16rem] px-4 text-center text-sm font-medium text-[#aaa]">
        {label}
      </p>
    </div>
  );
}
