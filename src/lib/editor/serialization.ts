/**
 * Blocks to HTML — serializes block data to HTML for DB storage
 * and renders blocks on the frontend.
 */

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  children?: Block[];
}

export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "gallery"
  | "list"
  | "quote"
  | "code"
  | "embed"
  | "separator"
  | "custom-html";

/**
 * Serialize blocks array to JSON string for database storage.
 */
export function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

/**
 * Deserialize stored block JSON back to Block array.
 */
export function deserializeBlocks(json: string): Block[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert a block to its HTML representation.
 */
export function blockToHtml(block: Block): string {
  switch (block.type) {
    case "paragraph":
      return `<p>${escapeHtml(String(block.data.text || ""))}</p>`;

    case "heading": {
      const level = (block.data.level as number) || 2;
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return `<${tag}>${escapeHtml(String(block.data.text || ""))}</${tag}>`;
    }

    case "image":
      return `<figure>
  <img src="${escapeHtml(String(block.data.url || ""))}" alt="${escapeHtml(String(block.data.alt || ""))}" />
  ${block.data.caption ? `<figcaption>${escapeHtml(String(block.data.caption))}</figcaption>` : ""}
</figure>`;

    case "gallery": {
      const images = (block.data.images as string[]) || [];
      return `<div class="gallery">${images
        .map(
          (url) =>
            `<img src="${escapeHtml(url)}" alt="" class="gallery-image" />`
        )
        .join("")}</div>`;
    }

    case "list": {
      const items = (block.data.items as string[]) || [];
      const ordered = block.data.ordered as boolean;
      const tag = ordered ? "ol" : "ul";
      return `<${tag}>${items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</${tag}>`;
    }

    case "quote":
      return `<blockquote>
  <p>${escapeHtml(String(block.data.text || ""))}</p>
  ${block.data.citation ? `<cite>— ${escapeHtml(String(block.data.citation))}</cite>` : ""}
</blockquote>`;

    case "code":
      return `<pre><code>${escapeHtml(String(block.data.code || ""))}</code></pre>`;

    case "embed":
      return `<div class="embed-container">${getEmbedHtml(
        String(block.data.url || ""),
        String(block.data.provider || "")
      )}</div>`;

    case "separator":
      return `<hr class="wp-block-separator" />`;

    case "custom-html":
      return String(block.data.html || "");

    default:
      return `<p>${escapeHtml(String(block.data.text || ""))}</p>`;
  }
}

/**
 * Convert an array of blocks to full HTML string.
 */
export function blocksToHtml(blocks: Block[]): string {
  return blocks.map((block) => blockToHtml(block)).join("\n");
}

/**
 * Get embed HTML for supported providers.
 */
function getEmbedHtml(url: string, provider: string): string {
  const lowerProvider = provider.toLowerCase();

  if (lowerProvider.includes("youtube") || lowerProvider.includes("youtu.be")) {
    const videoId = extractYoutubeId(url);
    if (videoId) {
      return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  if (lowerProvider.includes("twitter") || lowerProvider.includes("x")) {
    return `<blockquote class="twitter-tweet"><a href="${escapeHtml(url)}"></a></blockquote>`;
  }

  // Generic embed
  return `<iframe src="${escapeHtml(url)}" frameborder="0" allowfullscreen></iframe>`;
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
