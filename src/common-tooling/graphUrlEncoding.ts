import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

/**
 * Encodes a graph (or any JSON-serialisable value) as a compressed,
 * URL-safe string for the `?a=` share param — the same lz-string
 * scheme the TypeScript Playground uses for sharing code via URL.
 */
export function encodeGraphForUrl(graph: unknown): string {
  return compressToEncodedURIComponent(JSON.stringify(graph));
}

/**
 * Decodes a value produced by {@link encodeGraphForUrl}. Throws if the
 * string doesn't decompress to valid JSON — callers should treat a throw
 * (or lz-string's `null` return on malformed input) as "not found".
 */
export function decodeGraphFromUrl(raw: string): unknown {
  // lz-string's URI-safe alphabet still includes `+`, which some transports
  // (form-style query parsing, email clients) turn into a literal space —
  // undo that before decompressing, same as the old base64 decoder did.
  const normalized = raw.replace(/ /g, '+');
  const json = decompressFromEncodedURIComponent(normalized);
  if (json === null) {
    throw new Error('Failed to decompress graph from URL param');
  }
  return JSON.parse(json);
}
