/**
 * sanitize.ts — strips AI-artifact attributes from DB HTML before it's
 * rendered or baked into the static export.
 *
 * Removes:
 *  - data-start / data-end  (Claude / ChatGPT source-position markers)
 *  - data-sourcepos          (CommonMark renderer artefact)
 *  - Any other data-* attribute not explicitly needed by the site
 *  - Empty class / style attributes left behind after stripping
 */

/**
 * Strip all `data-*` attributes from an HTML string.
 * Safe to call on server-side (build time) only — uses regex, not a DOM parser.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  return html
    // Remove all data-* attributes (handles both quoted styles)
    .replace(/\s+data-[\w-]+="[^"]*"/g, '')
    .replace(/\s+data-[\w-]+='[^']*'/g, '')
    .replace(/\s+data-[\w-]+=\S+/g, '')
    // Remove empty class="" and style="" left by stripping
    .replace(/\s+class=""/g, '')
    .replace(/\s+style=""/g, '')
    .trim();
}
