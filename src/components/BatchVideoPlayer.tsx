"use client";

import { youtubeEmbedUrl, isYoutubePipelineBusy } from "@/lib/utils";
import { YoutubeStatusIcon } from "@/components/YoutubeStatusIcon";

export type BatchVideoItem = {
  id: string;
  source: string;
  urlOrPath: string;
  caption?: string | null;
  pipelineStatus?: string | null;
  pipelineError?: string | null;
  youtubeVideoId?: string | null;
  localPath?: string | null;
};

type Props = {
  video: BatchVideoItem;
  title?: string;
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

function YoutubeBadge({ video }: { video: BatchVideoItem }) {
  return (
    <div className="pointer-events-none absolute right-2 top-2 z-20">
      <YoutubeStatusIcon
        pipelineStatus={video.pipelineStatus}
        source={video.source}
        youtubeVideoId={video.youtubeVideoId}
        size="md"
      />
    </div>
  );
}

export function BatchVideoPlayer({
  video,
  title,
  compact,
  uploadingLabel = "В фоне: загрузка на YouTube…",
  failedLabel = "Не удалось загрузить на YouTube",
}: Props) {
  const embed =
    video.source === "youtube"
      ? youtubeEmbedUrl(video.urlOrPath, video.youtubeVideoId)
      : null;
  const localSrc = localPlaybackUrl(video);
  const busy = isYoutubePipelineBusy(video.pipelineStatus);
  const failed =
    video.pipelineStatus === "youtube_failed" ||
    video.pipelineStatus === "youtube_skipped";
  const frameClass = `relative aspect-video w-full overflow-hidden bg-black${
    compact ? "" : ""
  }`;

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
        <YoutubeBadge video={video} />
      </div>
    );
  }

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
        <YoutubeBadge video={video} />
        {failed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
            {video.pipelineError || failedLabel}
          </div>
        )}
        {busy && (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 z-10 px-3 text-center text-[11px] font-semibold tracking-wide text-white/90 drop-shadow">
            {uploadingLabel}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={frameClass} role="status" aria-live="polite">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0f0f0f]">
        <YoutubeStatusIcon
          pipelineStatus={video.pipelineStatus}
          source={video.source}
          youtubeVideoId={video.youtubeVideoId}
          size="lg"
        />
        <p className="max-w-[16rem] px-4 text-center text-sm font-medium text-[#aaa]">
          {failed ? failedLabel : uploadingLabel}
        </p>
      </div>
    </div>
  );
}
