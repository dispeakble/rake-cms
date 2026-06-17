/**
 * PHP Serialization Handler.
 *
 * Decodes PHP serialized strings (common in wp_options and wp_postmeta)
 * into JavaScript/JSON values using the php-serialize npm package.
 *
 * WordPress stores many settings as PHP-serialized arrays/objects.
 * During migration, these are decoded and stored as JSON strings.
 */

import phpSerializer from "php-serialize";

export interface SerializedData {
  /** Successfully decoded value (as JSON string for DB storage) */
  json: string | null;
  /** Whether decoding was successful */
  success: boolean;
  /** Original PHP serialized string */
  original: string;
  /** Flag this value if it can't be safely converted */
  isLegacy: boolean;
  /** Error message if decoding failed */
  error?: string;
}

/**
 * Attempt to decode a PHP serialized string.
 * Returns the decoded value as a JSON string, or null if it's plain text.
 */
export function decodePhpSerialized(value: string): SerializedData {
  const result: SerializedData = {
    json: null,
    success: false,
    original: value,
    isLegacy: false,
  };

  // If it doesn't look like PHP serialized data, return as-is
  if (!looksLikeSerialized(value)) {
    result.json = JSON.stringify(value);
    result.success = true;
    return result;
  }

  try {
    const decoded = phpSerializer.unserialize(value);
    if (decoded === null || decoded === undefined) {
      // null might mean it was a serialized null or an error
      result.json = JSON.stringify(value);
      result.success = true;
      return result;
    }

    // Convert any remaining PHP objects to plain objects
    const cleaned = cleanPhpObjects(decoded);
    result.json = JSON.stringify(cleaned);
    result.success = true;
    return result;
  } catch (error) {
    // If decoding fails, store in legacy data
    result.isLegacy = true;
    result.error = `PHP unserialize failed: ${(error as Error).message}`;
    result.json = JSON.stringify({ _legacy_serialized: value });
    return result;
  }
}

/**
 * Check if a string looks like PHP-serialized data.
 * PHP serialized strings start with type indicators:
 *  s:length:"value" (string)
 *  a:count:{...} (array)
 *  O:length:"class":count:{...} (object)
 *  i:value (integer)
 *  b:0/1 (boolean)
 *  N; (null)
 */
function looksLikeSerialized(value: string): boolean {
  if (!value || value.length < 2) return false;
  const firstChar = value[0];
  return (
    firstChar === "s" ||
    firstChar === "a" ||
    firstChar === "O" ||
    firstChar === "i" ||
    firstChar === "d" ||
    firstChar === "b" ||
    (firstChar === "N" && value[1] === ";")
  );
}

/**
 * Recursively clean PHP objects (stdClass) into plain objects/arrays.
 * The php-serialize library may return objects with __php_class__ keys.
 */
function cleanPhpObjects(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cleanPhpObjects);
  }

  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Skip PHP internal properties
      if (k.startsWith("__php_")) continue;
      cleaned[k] = cleanPhpObjects(v);
    }
    return cleaned;
  }

  return value;
}

/**
 * Batch decode an array of serialized values.
 * Used for bulk migrating wp_options rows.
 */
export function batchDecodeSerialized(
  values: Array<{ key: string; value: string }>
): Array<{ key: string; decoded: SerializedData }> {
  return values.map(({ key, value }) => ({
    key,
    decoded: decodePhpSerialized(value),
  }));
}

/**
 * Check if decoded data was flagged as legacy (could not be auto-converted).
 */
export function hasLegacyData(data: SerializedData): boolean {
  return data.isLegacy;
}

/**
 * Extract the count of legacy items from a batch.
 */
export function countLegacyItems(
  results: Array<{ key: string; decoded: SerializedData }>
): number {
  return results.filter((r) => r.decoded.isLegacy).length;
}
