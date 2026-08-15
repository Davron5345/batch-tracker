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
};

type Props = {
  video: BatchVideoItem;
  title?: string;
  /** Compact height for admin grid */
  compact?: boolean;
  uploadingLabel?: string;
  failedLabel?: string;
};

export function BatchVideoPlayer({
  video,
  title,
  compact,
  uploadingLabel = "Загрузка на YouTube…",
  failedLabel = "Не удалось загрузить на YouTube",
}: Props) {
  const embed = youtubeEmbedUrl(video.urlOrPath, video.youtubeVideoId);
  const busy = isYoutubePipelineBusy(video.pipelineStatus);
  const failed =
    video.pipelineStatus === "youtube_failed" ||
    video.pipelineStatus === "youtube_skipped";
  const frameClass = compact
    ? "relative aspect-video w-full overflow-hidden bg-black"
    : "relative aspect-video w-full overflow-hidden bg-black";

  if (embed && !busy) {
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

  if (busy || (!embed && video.source !== "upload")) {
    return (
      <div className={frameClass} role="status" aria-live="polite">
        <YoutubeSnakeLoading label={uploadingLabel} />
      </div>
    );
  }

  if (failed && !embed) {
    return (
      <div className={frameClass}>
        {video.source === "upload" && video.urlOrPath ? (
          <video
            src={video.urlOrPath}
            controls
            className="absolute inset-0 h-full w-full object-contain"
            playsInline
          />
        ) : (
          <YoutubeSnakeLoading label={failedLabel} staticBar />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
          {video.pipelineError || failedLabel}
        </div>
      </div>
    );
  }

  // Local file while waiting / fallback
  if (video.source === "upload" && video.urlOrPath && !busy) {
    return (
      <div className={frameClass}>
        <video
          src={video.urlOrPath}
          controls
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
        />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <YoutubeSnakeLoading label={uploadingLabel} />
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
