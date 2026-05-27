import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  buildNoteEmbedText,
  chunkDocumentId,
  chunkNote,
} from "@/lib/RAG/chunk"

describe("buildNoteEmbedText", () => {
  it("prefixes title before body", () => {
    expect(buildNoteEmbedText("My Note", "Hello world")).toBe(
      "Title: My Note\n\nHello world"
    )
  })

  it("returns empty string when title and content are blank", () => {
    expect(buildNoteEmbedText("  ", "\n")).toBe("")
  })
})

describe("chunkDocumentId", () => {
  it("formats noteId and chunk index", () => {
    expect(chunkDocumentId("note-1", 0)).toBe("note-1:0")
  })
})

describe("chunkNote", () => {
  const baseInput = {
    userId: "user-1",
    noteId: "note-1",
    notebookId: "nb-1",
    title: "Test",
    content: "Short body.",
  }

  it("returns documents with required metadata", async () => {
    const docs = await chunkNote(baseInput)

    expect(docs.length).toBeGreaterThanOrEqual(1)
    expect(docs[0].pageContent).toContain("Title: Test")
    expect(docs[0].metadata).toEqual({
      userId: "user-1",
      noteId: "note-1",
      chunkIndex: 0,
      title: "Test",
      notebookId: "nb-1",
    })
  })

  it("returns no documents for empty notes", async () => {
    const docs = await chunkNote({
      ...baseInput,
      title: "",
      content: "",
    })

    expect(docs).toEqual([])
  })
})
