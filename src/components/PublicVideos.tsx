"use client";

import { useEffect, useState } from "react";
import {
  BatchVideoPlayer,
  type BatchVideoItem,
} from "@/components/BatchVideoPlayer";
import { isYoutubePipelineBusy } from "@/lib/utils";

type Props = {
  token: string;
  initialVideos: BatchVideoItem[];
  heading: string;
  uploadingLabel: string;
  failedLabel: string;
};

export function PublicVideos({
  token,
  initialVideos,
  heading,
  uploadingLabel,
  failedLabel,
}: Props) {
  const [videos, setVideos] = useState(initialVideos);

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const busy = videos.some((v) => isYoutubePipelineBusy(v.pipelineStatus));

  useEffect(() => {
    if (!busy) return;

    const tick = async () => {
      try {
        const res = await fetch(`/api/public/b/${token}/videos`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { videos: BatchVideoItem[] };
        setVideos(data.videos);
      } catch {
        /* ignore transient network errors */
      }
    };

    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [token, busy]);

  if (videos.length === 0) return null;

  return (
    <section className="card mt-4 p-6">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="mt-4 space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="overflow-hidden rounded-xl">
            <BatchVideoPlayer
              video={video}
              uploadingLabel={uploadingLabel}
              failedLabel={failedLabel}
            />
            {video.caption && (
              <p className="bg-white px-3 py-2 text-sm text-[var(--muted)]">
                {video.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
