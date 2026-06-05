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

  it("splits markdown on heading boundaries when content exceeds chunk size", async () => {
    const sectionBody = "word ".repeat(350).trim()
    const content = `## Section A\n\n${sectionBody}\n\n## Section B\n\n${sectionBody}`
    const docs = await chunkNote({ ...baseInput, title: "Note", content })

    expect(docs.length).toBeGreaterThan(1)
    const sectionAOnly = docs.some(
      (doc) => doc.pageContent.includes("Section A") && !doc.pageContent.includes("Section B")
    )
    const sectionBOnly = docs.some(
      (doc) => doc.pageContent.includes("Section B") && !doc.pageContent.includes("Section A")
    )
    expect(sectionAOnly).toBe(true)
    expect(sectionBOnly).toBe(true)
    docs.forEach((doc) => {
      expect(doc.pageContent.startsWith("Title: Note")).toBe(true)
    })
  })

  it("splits quill html on heading tags when content exceeds chunk size", async () => {
    const sectionBody = "word ".repeat(350).trim()
    const content = `<h2>Section A</h2><p>${sectionBody}</p><h2>Section B</h2><p>${sectionBody}</p>`
    const docs = await chunkNote({ ...baseInput, title: "Note", content })

    expect(docs.length).toBeGreaterThan(1)
    expect(
      docs.some(
        (doc) => doc.pageContent.includes("Section A") && !doc.pageContent.includes("Section B")
      )
    ).toBe(true)
    expect(
      docs.some(
        (doc) => doc.pageContent.includes("Section B") && !doc.pageContent.includes("Section A")
      )
    ).toBe(true)
  })

  it("keeps a small html code block in one chunk", async () => {
    const code = "const answer = 42;"
    const content = `<p>Intro.</p><pre class="ql-syntax">${code}</pre><p>Outro.</p>`
    const docs = await chunkNote({ ...baseInput, title: "Note", content })

    const codeChunk = docs.find((doc) => doc.pageContent.includes(code))
    expect(codeChunk).toBeDefined()
    expect(codeChunk?.pageContent).toContain("<pre")
    expect(codeChunk?.pageContent).toContain(code)
  })
})
