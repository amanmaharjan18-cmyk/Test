/**
 * Convert a string into a URL-friendly slug.
 *
 * Contract:
 * - `input` must be a string; anything else throws a TypeError.
 * - Output is ASCII-only and matches `[a-z0-9-]*`: lowercase, with no leading,
 *   trailing, or consecutive hyphens. It may be the empty string.
 * - Accented Latin letters are folded to their base letter via NFKD
 *   decomposition ("Café" -> "cafe").
 * - Every other run of characters is treated as a single separator. This
 *   includes non-Latin scripts and letters with no Unicode decomposition,
 *   such as ß, æ, and ø.
 *
 * @param {string} input
 * @returns {string}
 * @throws {TypeError} if `input` is not a string
 */
export function slugify(input) {
  if (typeof input !== 'string') {
    throw new TypeError('slugify: expected a string, got ' + typeof input);
  }
  return input
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
