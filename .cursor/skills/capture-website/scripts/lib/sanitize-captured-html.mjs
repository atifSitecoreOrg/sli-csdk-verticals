/**
 * Remove third-party secrets from captured HTML before writing to disk.
 * Captured pages often embed client-side API keys (e.g. Google Maps) that must not be committed.
 */
export function sanitizeCapturedHtml(html) {
  if (!html || typeof html !== 'string') return html;

  return (
    html
      // Google API keys (Maps, etc.)
      .replace(/AIzaSy[A-Za-z0-9_-]{33}/g, 'REDACTED')
      // Common data-* attribute forms
      .replace(
        /(data-maps-api-key|data-api-key|data-google-api-key)=(["'])[^"']*\2/gi,
        '$1=$2REDACTED$2'
      )
  );
}
