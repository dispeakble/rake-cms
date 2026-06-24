/**
 * Rake CMS — Shortcode Parser
 *
 * WordPress-compatible shortcode system.
 * Parses [shortcode] syntax in post content and replaces
 * with rendered HTML.
 *
 * Usage:
 *   import { addShortcode, doShortcode } from "@/lib/shortcodes";
 *
 *   // Register a shortcode
 *   addShortcode("gallery", (attrs, content) => {
 *     const ids = attrs.ids || "";
 *     return `<div class="gallery">${ids}</div>`;
 *   });
 *
 *   // Process content
 *   const html = await doShortcode(postContent);
 */

interface ShortcodeAttrs {
  [key: string]: string;
}

type ShortcodeCallback = (
  attrs: ShortcodeAttrs,
  content: string | null,
  name: string
) => string | Promise<string>;

interface ShortcodeRegistration {
  callback: ShortcodeCallback;
}

const shortcodes = new Map<string, ShortcodeRegistration>();

/**
 * Register a shortcode handler.
 *
 * @param tag - The shortcode tag (e.g., "gallery", "audio", "video")
 * @param callback - Function that receives attrs + content and returns HTML
 */
export function addShortcode(
  tag: string,
  callback: ShortcodeCallback
): void {
  const normalizedTag = tag.toLowerCase().trim();
  shortcodes.set(normalizedTag, { callback });
}

/**
 * Remove a registered shortcode.
 */
export function removeShortcode(tag: string): void {
  shortcodes.delete(tag.toLowerCase());
}

/**
 * Remove all registered shortcodes.
 */
export function removeAllShortcodes(): void {
  shortcodes.clear();
}

/**
 * Check if a shortcode is registered.
 */
export function shortcodeExists(tag: string): boolean {
  return shortcodes.has(tag.toLowerCase());
}

/**
 * Parse shortcode attributes from a string.
 * Supports: key="value" key='value' key=value
 */
function parseShortcodeAttrs(text: string): ShortcodeAttrs {
  const attrs: ShortcodeAttrs = {};
  const regex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    attrs[match[1]] = match[2] || match[3] || match[4] || "";
  }

  return attrs;
}

/**
 * Parse and process all shortcodes in content.
 * Handles self-closing [tag] and enclosing [tag]content[/tag] forms.
 *
 * @param content - The post content with shortcodes
 * @returns Content with shortcodes replaced by rendered HTML
 */
export async function doShortcode(content: string): Promise<string> {
  if (!content || shortcodes.size === 0) return content;

  let result = content;

  // Process each registered shortcode
  for (const [tag] of shortcodes) {
    // First pass: enclosing shortcodes [tag]content[/tag]
    const enclosingRegex = new RegExp(
      `\\[${tag}\\b([^\\]]*)\\]([\\s\\S]*?)\\[\\/${tag}\\]`,
      "gi"
    );

    result = await replaceAsync(result, enclosingRegex, async (match, attrsStr, innerContent) => {
      const attrs = parseShortcodeAttrs(attrsStr.trim());
      const registration = shortcodes.get(tag);
      if (!registration) return match;
      return await registration.callback(attrs, innerContent || null, tag);
    });

    // Second pass: self-closing shortcodes [tag /] or [tag]
    const selfClosingRegex = new RegExp(
      `\\[${tag}\\b([^\\]]*)\\/?\\]`,
      "gi"
    );

    result = await replaceAsync(result, selfClosingRegex, async (match, attrsStr) => {
      const attrs = parseShortcodeAttrs(attrsStr.trim());
      const registration = shortcodes.get(tag);
      if (!registration) return match;
      return await registration.callback(attrs, null, tag);
    });
  }

  return result;
}

/**
 * String.replace with async callback support.
 */
async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: string[]) => Promise<string>
): Promise<string> {
  const promises: Promise<string>[] = [];
  const replacements: string[] = [];

  str.replace(regex, (match, ...args) => {
    const resultIndex = replacements.length;
    replacements.push(match);
    promises.push(asyncFn(match, ...args));
    return match;
  });

  const results = await Promise.all(promises);
  let i = 0;
  return str.replace(regex, () => results[i++]);
}

/**
 * Register built-in shortcodes (called at app startup).
 */
export function initializeShortcodes(): void {
  // Gallery shortcode
  addShortcode("gallery", (attrs) => {
    const ids = attrs.ids || attrs.id || "";
    const columns = parseInt(attrs.columns || attrs.cols || "3");
    const size = attrs.size || "thumbnail";
    const idsArray = ids.split(",").map((id) => id.trim()).filter(Boolean);

    if (idsArray.length === 0) return "";

    let html = `<div class="wp-block-gallery has-nested-images columns-${Math.min(columns, 8)}">`;
    for (const id of idsArray) {
      html += `<figure class="wp-block-image size-${size}"><img src="${id}" alt="" /></figure>`;
    }
    html += "</div>";

    return html;
  });

  // Audio shortcode
  addShortcode("audio", (attrs) => {
    const src = attrs.src || "";
    if (!src) return "";
    return `<audio controls preload="none" style="width:100%"><source src="${src}" type="audio/mpeg" /></audio>`;
  });

  // Video shortcode
  addShortcode("video", (attrs) => {
    const src = attrs.src || "";
    const poster = attrs.poster || "";
    const width = attrs.width || "640";
    const height = attrs.height || "360";
    if (!src) return "";

    let html = `<video controls width="${width}" height="${height}" style="max-width:100%"`;
    if (poster) html += ` poster="${poster}"`;
    html += ">";

    // Support multiple sources
    const sources = ["mp4", "webm", "ogv"];
    for (const format of sources) {
      const formatSrc = attrs[format] || (format === "mp4" ? src : null);
      if (formatSrc) {
        html += `<source src="${formatSrc}" type="video/${format === "ogv" ? "ogg" : format}" />`;
      }
    }
    html += "</video>";

    return html;
  });

  // Caption shortcode
  addShortcode("caption", (_attrs, content) => {
    if (!content) return "";
    return `<figure class="wp-block-image"><figcaption class="wp-element-caption">${content}</figcaption></figure>`;
  });

  // Embed wrapper
  addShortcode("embed", (attrs) => {
    const url = attrs.url || "";
    if (!url) return "";

    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return `<div class="wp-block-embed__wrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
    }

    return `<div class="wp-block-embed__wrapper"><a href="${url}">${url}</a></div>`;
  });
}
