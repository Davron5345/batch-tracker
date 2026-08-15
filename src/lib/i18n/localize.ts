import { DEFAULT_LOCALE, type Locale } from "./config";

export type LocalizedNames = {
  name?: string | null;
  nameRu?: string | null;
  nameUz?: string | null;
  nameEn?: string | null;
};

export type LocalizedDescriptions = {
  description?: string | null;
  descriptionRu?: string | null;
  descriptionUz?: string | null;
  descriptionEn?: string | null;
};

export function pickLocalizedName(
  item: LocalizedNames,
  locale: Locale = DEFAULT_LOCALE
): string {
  const map: Record<Locale, string | null | undefined> = {
    ru: item.nameRu || item.name,
    uz: item.nameUz,
    en: item.nameEn,
  };
  return (
    map[locale]?.trim() ||
    item.nameRu?.trim() ||
    item.name?.trim() ||
    item.nameUz?.trim() ||
    item.nameEn?.trim() ||
    ""
  );
}

export function pickLocalizedDescription(
  item: LocalizedDescriptions,
  locale: Locale = DEFAULT_LOCALE
): string {
  const map: Record<Locale, string | null | undefined> = {
    ru: item.descriptionRu || item.description,
    uz: item.descriptionUz,
    en: item.descriptionEn,
  };
  return (
    map[locale]?.trim() ||
    item.descriptionRu?.trim() ||
    item.description?.trim() ||
    item.descriptionUz?.trim() ||
    item.descriptionEn?.trim() ||
    ""
  );
}
