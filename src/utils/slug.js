// Base62 character set: a-z A-Z 0-9
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates a cryptographically random Base62 slug.
 * 6 characters = 62^6 ≈ 56.8 billion combinations.
 */
export function generateSlug(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => CHARS[b % CHARS.length])
    .join('');
}
