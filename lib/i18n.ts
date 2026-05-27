/**
 * i18n — parses the existing Beego .ini locale files and exposes a tr() helper.
 *
 * INI format:
 *   {key} = Value                → top-level key
 *   [section]
 *   key = Value                  → sectioned key, accessed as "section.key"
 */
import fs from 'fs';
import path from 'path';
import type { Lang } from '@/types';

type Translations = Record<string, string>;

const cache: Partial<Record<Lang, Translations>> = {};

function parseIni(content: string): Translations {
  const result: Translations = {};
  let currentSection = '';

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';')) continue; // blank or comment

    // Section header: [section]
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    // Key=value
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const rawKey = line.slice(0, eqIdx).trim();
    const value  = line.slice(eqIdx + 1).trim();

    // Top-level keys use {key} format, sectioned keys are plain
    const key = rawKey.replace(/^\{|\}$/g, '');

    const fullKey = currentSection ? `${currentSection}.${key}` : key;
    result[fullKey] = value;
  }

  return result;
}

function loadLocale(lang: Lang): Translations {
  if (cache[lang]) return cache[lang]!;

  const filePath = path.join(process.cwd(), 'locales', `locale_${lang}.ini`);
  const content  = fs.readFileSync(filePath, 'utf-8');
  cache[lang]    = parseIni(content);
  return cache[lang]!;
}

/**
 * Translate a key for a given language.
 * Falls back to English if the key is missing.
 *
 * @param lang  Language code
 * @param key   Key in "section.key" or "key" format
 */
export function tr(lang: Lang, key: string): string {
  const t   = loadLocale(lang);
  const val = t[key];
  if (val !== undefined) return val;

  // fallback to en
  if (lang !== 'en') {
    const en = loadLocale('en');
    return en[key] ?? key;
  }
  return key;
}

/** Returns all translations for a language (useful for passing to components). */
export function getTranslations(lang: Lang): Translations {
  return loadLocale(lang);
}
