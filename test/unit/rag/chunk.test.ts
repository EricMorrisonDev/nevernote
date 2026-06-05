import { createHash } from "crypto"
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  buildNoteEmbedText,
  chunkDocumentId,
  chunkNote,
  toContentHash,
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

describe("toContentHash", () => {
  it("returns a stable sha256 hex digest for the same title and content", () => {
    const first = toContentHash("My Note", "Hello world")
    const second = toContentHash("My Note", "Hello world")

    expect(first).toBe(second)
    expect(first).toMatch(/^[a-f0-9]{64}$/)
  })

  it("hashes buildNoteEmbedText output so trimming matches chunking", () => {
    const fromHelper = toContentHash("My Note", "Hello world")
    const embedText = buildNoteEmbedText("My Note", "Hello world")
    const expected = createHash("sha256").update(embedText).digest("hex")

    expect(fromHelper).toBe(expected)
  })

  it("changes when content changes", () => {
    expect(toContentHash("My Note", "Hello world")).not.toBe(
      toContentHash("My Note", "Goodbye world")
    )
  })

  it("hashes empty embed text for blank notes", () => {
    const emptyHash = createHash("sha256").update("").digest("hex")

    expect(toContentHash("", "")).toBe(emptyHash)
    expect(toContentHash("  ", "\n")).toBe(emptyHash)
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
