// Internationalization core.
//  - `t(key, params?)` — translate a dotted key, falling back to English.
//  - `setLocale` / `getLocale` — read or change the active locale.
//  - `onLocaleChange(fn)` — subscribe to re-translate when the user switches.
//  - Locale is detected from localStorage → navigator.language → "en".

import { en, type Dict } from "./locales/en";
import { zh } from "./locales/zh";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { ru } from "./locales/ru";
import { it } from "./locales/it";
import { pt } from "./locales/pt";

export type Locale = "en" | "zh" | "ja" | "ko" | "es" | "fr" | "de" | "ru" | "it" | "pt";

const DICTS: Record<Locale, Partial<Dict>> = {
  en, zh, ja, ko, es, fr, de, ru, it, pt,
};

export const LOCALES: Locale[] = ["en", "zh", "ja", "ko", "es", "fr", "de", "ru", "it", "pt"];

// Shown in the language-picker grid — always in the language's native script.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  it: "Italiano",
  pt: "Português",
};

const LOCALE_STORAGE_KEY = "pandoku.locale";

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && LOCALES.includes(saved)) return saved;
  } catch { /* no storage */ }
  const raw = (navigator.language || "en").toLowerCase();
  const primary = raw.split("-")[0] as Locale;
  if (LOCALES.includes(primary)) return primary;
  return "en";
}

let current: Locale = detectLocale();

export function getLocale(): Locale { return current; }

const listeners = new Set<() => void>();
export function onLocaleChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLocale(l: Locale): void {
  if (!LOCALES.includes(l) || l === current) return;
  current = l;
  try { localStorage.setItem(LOCALE_STORAGE_KEY, l); } catch { /* ignore */ }
  for (const fn of listeners) fn();
}

/** Look up a dotted key in the active dictionary. Falls back to English if any
 *  lookup segment is missing. `{placeholder}` tokens are substituted from `params`. */
export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split(".");
  let str: string | undefined;

  const dig = (root: unknown): string | undefined => {
    let node: unknown = root;
    for (const p of parts) {
      if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[p];
      } else return undefined;
    }
    return typeof node === "string" ? node : undefined;
  };

  str = dig(DICTS[current]);
  if (str === undefined) str = dig(en);
  if (str === undefined) return key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
