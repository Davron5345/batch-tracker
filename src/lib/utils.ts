export type Characteristic = { key: string; value: string };

export function parseCharacteristics(raw: string | null | undefined): Characteristic[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is Characteristic =>
          item &&
          typeof item === "object" &&
          typeof item.key === "string" &&
          typeof item.value === "string"
      )
      .map((item) => ({ key: item.key.trim(), value: item.value.trim() }))
      .filter((item) => item.key.length > 0);
  } catch {
    return [];
  }
}

export function stringifyCharacteristics(items: Characteristic[]): string {
  return JSON.stringify(
    items
      .map((item) => ({ key: item.key.trim(), value: item.value.trim() }))
      .filter((item) => item.key.length > 0)
  );
}

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

export function extractYoutubeId(urlOrId: string): string | null {
  const raw = urlOrId.trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(
  urlOrId: string,
  youtubeVideoId?: string | null
): string | null {
  const id = youtubeVideoId?.trim() || extractYoutubeId(urlOrId);
  return id && YOUTUBE_ID_RE.test(id)
    ? `https://www.youtube.com/embed/${id}`
    : null;
}

export function isYoutubePipelineBusy(status?: string | null): boolean {
  return (
    status === "pending_youtube" ||
    status === "uploading_youtube"
  );
}

export function formatDateRu(date: Date | string): string {
  return formatDateLocalized(date, "ru");
}

export function formatDateLocalized(
  date: Date | string,
  locale: "ru" | "uz" | "en" = "ru"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tag = locale === "uz" ? "uz-UZ" : locale === "en" ? "en-GB" : "ru-RU";
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTimeRu(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
