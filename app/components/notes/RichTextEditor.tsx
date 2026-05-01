"use client";

import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  readOnly?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "blockquote",
    "code-block",
  ];

  return (
    <div className="h-full min-h-0 flex flex-col">
      <ReactQuill
        className="h-full min-h-0 flex flex-col"
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .quill .ql-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .quill .ql-editor {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .quill .ql-toolbar {
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
        }

        .quill .ql-container {
            border-bottom-left-radius: 0.75rem;
            border-bottom-right-radius: 0.75rem;
        }

        .quill {
            border-radius: 0.75rem;
            overflow: hidden;
        }

        /* Toolbar: Snow theme assumes a light bar; tune for dark UI */
        .quill .ql-toolbar.ql-snow {
          background: var(--surface-2);
          border-color: var(--border);
        }

        .quill .ql-toolbar.ql-snow .ql-stroke {
          stroke: var(--muted);
        }

        .quill .ql-toolbar.ql-snow .ql-fill {
          fill: var(--muted);
        }

        .quill .ql-toolbar.ql-snow .ql-picker,
        .quill .ql-toolbar.ql-snow .ql-picker-label,
        .quill .ql-toolbar.ql-snow .ql-picker-item {
          color: var(--foreground);
        }

        .quill .ql-toolbar.ql-snow .ql-picker-label::before,
        .quill .ql-toolbar.ql-snow .ql-picker-item::before {
          color: var(--foreground);
        }

        .quill .ql-toolbar.ql-snow button:hover .ql-stroke,
        .quill .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke {
          stroke: var(--control);
        }

        .quill .ql-toolbar.ql-snow button:hover .ql-fill,
        .quill .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill {
          fill: var(--control);
        }

        .quill .ql-toolbar.ql-snow button.ql-active .ql-stroke,
        .quill .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-stroke {
          stroke: var(--control);
        }

        .quill .ql-toolbar.ql-snow button.ql-active .ql-fill,
        .quill .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-fill {
          fill: var(--control);
        }

        .quill .ql-toolbar.ql-snow button:hover,
        .quill .ql-toolbar.ql-snow .ql-picker-label:hover {
          color: var(--control);
        }

        .quill .ql-container.ql-snow {
          border-color: var(--border);
          background: var(--surface);
        }

        .quill .ql-editor.ql-blank::before {
          color: var(--muted);
          font-style: normal;
        }

        .quill .ql-toolbar.ql-snow .ql-picker-options {
          background: var(--surface-2);
          border-color: var(--border);
        }

        .quill .ql-toolbar.ql-snow .ql-picker-item:hover {
          color: var(--control);
        }
      `}</style>
    </div>
  );
}