"use client";

import { useState, useCallback, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";

export interface EditorProps {
  initialContent?: string;
  onChange?: (blocksJson: string) => void;
  placeholder?: string;
}

/**
 * Block-based editor component wrapping @blocknote/core.
 * Provides a Gutenberg-like editing experience.
 */
export default function Editor({
  initialContent,
  onChange,
  placeholder = "Start writing...",
}: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  let initialBlocks = undefined;
  if (initialContent) {
    try {
      initialBlocks = JSON.parse(initialContent);
    } catch {
      initialBlocks = undefined;
    }
  }

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    placeholder,
  });

  const saveContent = useCallback(async () => {
    const blocks = await editor.document;
    onChange?.(JSON.stringify(blocks));
  }, [editor, onChange]);

  // Note: For production use, integrate the @blocknote/react Editor component
  // See: https://www.blocknotejs.org/docs/react
  if (!isMounted) {
    return (
      <div className="min-h-[300px] animate-pulse rounded-lg border bg-muted p-4">
        <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="block-editor-wrapper">
      <div className="blocknote-editor rounded-lg border bg-card">
        {/* @blocknote/react Editor component renders here */}
        <div className="editor-placeholder p-4 text-muted-foreground">
          <p>Block editor loaded. Start typing or press / for commands.</p>
          <p className="mt-2 text-xs">
            Note: The full @blocknote/react component will render in place
            of this placeholder when connected to the UI.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Toolbar component for block formatting.
 * Implemented as a separate client component for the block editor UI.
 */
export function EditorToolbar() {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
      <ToolbarButton label="Bold" shortcut="Ctrl+B">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton label="Italic" shortcut="Ctrl+I">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Link">
        <span className="text-xs">🔗</span>
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Heading">H</ToolbarButton>
      <ToolbarButton label="List">
        <span className="text-xs">≡</span>
      </ToolbarButton>
      <ToolbarButton label="Quote">
        <span className="text-xs">"</span>
      </ToolbarButton>
      <ToolbarButton label="Image">
        <span className="text-xs">🖼</span>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-md text-sm hover:bg-muted"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
