"use client";

import { useEffect, useState } from "react";

type Props = {
  pipelineStatus?: string | null;
  source?: string | null;
  youtubeVideoId?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

function targetProgress(
  status?: string | null,
  source?: string | null,
  youtubeVideoId?: string | null
): { target: number; animate: boolean } {
  if (
    source === "youtube" ||
    (youtubeVideoId &&
      (status === "pending_archive" ||
        status === "archiving" ||
        status === "archived" ||
        status === "archive_failed"))
  ) {
    return { target: 100, animate: false };
  }

  switch (status) {
    case "pending_youtube":
      return { target: 12, animate: true };
    case "uploading_youtube":
      return { target: 72, animate: true };
    case "processing_youtube":
      return { target: 96, animate: true };
    default:
      return { target: 0, animate: false };
  }
}

export function YoutubeStatusIcon({
  pipelineStatus,
  source,
  youtubeVideoId,
  className = "",
  size = "md",
}: Props) {
  const { target, animate } = targetProgress(
    pipelineStatus,
    source,
    youtubeVideoId
  );
  const [progress, setProgress] = useState(target);

  useEffect(() => {
    if (!animate) {
      setProgress(target);
      return;
    }
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return target;
        const step = Math.max(0.35, (target - p) * 0.07);
        return Math.min(target, +(p + step).toFixed(2));
      });
    }, 100);
    return () => clearInterval(id);
  }, [target, animate]);

  const ready = progress >= 99.5;
  const pct = Math.round(progress);
  const sizeClass =
    size === "sm" ? "yt-glow--sm" : size === "lg" ? "yt-glow--lg" : "yt-glow--md";
  const clipRight = Math.max(0, 100 - progress);

  return (
    <div
      className={`yt-glow ${sizeClass} ${ready ? "yt-glow--ready" : ""} ${className}`}
      role="img"
      aria-label={
        ready
          ? "На YouTube"
          : progress > 0
            ? `Загрузка на YouTube ${pct}%`
            : "Ещё не на YouTube"
      }
      title={
        ready
          ? "На YouTube"
          : progress > 0
            ? `YouTube ${pct}%`
            : "Не загружено на YouTube"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/youtube.png"
        alt=""
        className="yt-glow__icon yt-glow__icon--dim"
        draggable={false}
      />
      <div
        className="yt-glow__bright-wrap"
        style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/youtube.png"
          alt=""
          className="yt-glow__icon yt-glow__icon--bright"
          draggable={false}
        />
      </div>
      {(animate || (progress > 0 && progress < 100)) && (
        <span className="yt-glow__pct">{pct}%</span>
      )}
    </div>
  );
}
