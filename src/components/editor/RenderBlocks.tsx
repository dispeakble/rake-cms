import { type Block } from "@/lib/editor/serialization";

interface RenderBlocksProps {
  /** JSON string of blocks from the database */
  blocksJson: string;
}

/**
 * Renders block data from the database on the frontend.
 * Converts stored block JSON to HTML with proper styling.
 */
export default function RenderBlocks({ blocksJson }: RenderBlocksProps) {
  let blocks: Block[];
  try {
    blocks = JSON.parse(blocksJson);
    if (!Array.isArray(blocks)) {
      return <div className="prose" dangerouslySetInnerHTML={{ __html: blocksJson }} />;
    }
  } catch {
    // If not valid block JSON, render as regular content
    return <div className="prose" dangerouslySetInnerHTML={{ __html: blocksJson }} />;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="leading-relaxed">{String(block.data.text || "")}</p>
      );

    case "heading": {
      const level = Math.min(Math.max((block.data.level as number) || 2, 1), 6);
      const text = String(block.data.text || "");
      const cls = "font-bold tracking-tight";
      const sizes: Record<number, string> = {
        1: "text-4xl",
        2: "text-3xl",
        3: "text-2xl",
        4: "text-xl",
        5: "text-lg",
        6: "text-base",
      };
      const size = sizes[level] || "text-xl";

      switch (level) {
        case 1: return <h1 className={`${cls} ${size}`}>{text}</h1>;
        case 2: return <h2 className={`${cls} ${size}`}>{text}</h2>;
        case 3: return <h3 className={`${cls} ${size}`}>{text}</h3>;
        case 4: return <h4 className={`${cls} ${size}`}>{text}</h4>;
        case 5: return <h5 className={`${cls} ${size}`}>{text}</h5>;
        case 6: return <h6 className={`${cls} ${size}`}>{text}</h6>;
        default: return <h2 className={`${cls} ${size}`}>{text}</h2>;
      }
    }

    case "image":
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(block.data.url || "")}
            alt={String(block.data.alt || "")}
            className="rounded-lg"
          />
          {block.data.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {String(block.data.caption)}
            </figcaption>
          ) : null}
        </figure>
      );

    case "gallery": {
      const images = (block.data.images as string[]) || [];
      return (
        <div className="my-6 grid grid-cols-2 gap-2 md:grid-cols-3">
          {images.map((url, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={i} src={url} alt="" className="rounded-lg object-cover" />
          ))}
        </div>
      );
    }

    case "list": {
      const items = (block.data.items as string[]) || [];
      const ordered = block.data.ordered as boolean;
      const ListTag = ordered ? "ol" : "ul";

      if (ordered) {
        return (
          <ol className="list-decimal space-y-1 pl-6">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="list-disc space-y-1 pl-6">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    case "quote":
      return (
        <blockquote className="my-6 border-l-4 border-primary pl-4 italic">
          <p>{String(block.data.text || "")}</p>
          {block.data.citation ? (
            <cite className="mt-2 block text-sm text-muted-foreground">
              — {String(block.data.citation)}
            </cite>
          ) : null}
        </blockquote>
      );

    case "code":
      return (
        <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{String(block.data.code || "")}</code>
        </pre>
      );

    case "embed":
      return (
        <div
          className="my-6 aspect-video overflow-hidden rounded-lg"
          dangerouslySetInnerHTML={{
            __html: getEmbedHtml(
              String(block.data.url || ""),
              String(block.data.provider || "")
            ),
          }}
        />
      );

    case "separator":
      return <hr className="my-8 border-border" />;

    case "custom-html":
      return (
        <div
          className="my-4"
          dangerouslySetInnerHTML={{ __html: String(block.data.html || "") }}
        />
      );

    default:
      return (
        <p className="text-muted-foreground">
          {String(block.data.text || "")}
        </p>
      );
  }
}

function getEmbedHtml(url: string, provider: string): string {
  const lower = provider.toLowerCase();
  if (lower.includes("youtube")) {
    const id = extractYoutubeId(url);
    if (id) {
      return `<iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>`;
    }
  }
  return `<iframe src="${url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>`;
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
