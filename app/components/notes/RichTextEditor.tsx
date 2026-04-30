"use client";

import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
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
        onBlur={() => onBlur()}
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
      `}</style>
    </div>
  );
}