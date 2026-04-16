"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
    ],
    content: value || (placeholder ? "" : undefined),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Normalise empty document so server action receives "" not "<p></p>"
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "min-h-[120px] px-3 py-2.5 text-sm text-ink focus:outline-none",
      },
    },
  });

  return (
    <div className="border border-ink/20 bg-white focus-within:border-ink/60 transition-colors">
      <Toolbar editor={editor} />
      {!editor && placeholder && (
        <div className="min-h-[120px] px-3 py-2.5 text-sm text-ink-muted">
          {placeholder}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="h-9 border-b border-ink/10" />;

  return (
    <div className="flex flex-wrap gap-px border-b border-ink/10 px-1.5 py-1">
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <span className="font-bold">B</span>
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <span className="italic">I</span>
      </ToolBtn>

      <div className="w-px bg-ink/10 mx-1 self-stretch" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolBtn>

      <div className="w-px bg-ink/10 mx-1 self-stretch" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <BulletIcon />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered list"
      >
        <OrderedIcon />
      </ToolBtn>

      <div className="w-px bg-ink/10 mx-1 self-stretch" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <QuoteIcon />
      </ToolBtn>
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center text-xs transition-colors ${
        active
          ? "bg-paper-warm text-ink"
          : "text-ink-muted hover:text-ink hover:bg-paper-warm"
      }`}
    >
      {children}
    </button>
  );
}

function BulletIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <circle cx="2.5" cy="4.5" r="1.5" />
      <rect x="5" y="3.5" width="9" height="2" rx="1" />
      <circle cx="2.5" cy="8" r="1.5" />
      <rect x="5" y="7" width="9" height="2" rx="1" />
      <circle cx="2.5" cy="11.5" r="1.5" />
      <rect x="5" y="10.5" width="9" height="2" rx="1" />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <text x="0" y="5.5" fontSize="5" fontFamily="monospace">1.</text>
      <rect x="5" y="3.5" width="9" height="2" rx="1" />
      <text x="0" y="9.5" fontSize="5" fontFamily="monospace">2.</text>
      <rect x="5" y="7" width="9" height="2" rx="1" />
      <text x="0" y="13.5" fontSize="5" fontFamily="monospace">3.</text>
      <rect x="5" y="10.5" width="9" height="2" rx="1" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <path d="M3 4h2v4H3V4zm4 0h2v4H7V4zM3 9h2v3H3V9zm4 0h2v3H7V9z" opacity=".4" />
      <rect x="1" y="3" width="1.5" height="10" rx=".75" />
    </svg>
  );
}
