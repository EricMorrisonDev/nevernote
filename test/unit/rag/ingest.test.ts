import { Document } from "@langchain/core/documents"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const {
  mockDeleteRagDocumentsForNote,
  mockUpsertRagDocuments,
  mockChunkNote,
  mockChunkDocumentId,
} = vi.hoisted(() => ({
  mockDeleteRagDocumentsForNote: vi.fn().mockResolvedValue(undefined),
  mockUpsertRagDocuments: vi.fn().mockResolvedValue(undefined),
  mockChunkNote: vi.fn(),
  mockChunkDocumentId: vi.fn(
    (noteId: string, chunkIndex: number) => `${noteId}:${chunkIndex}`
  ),
}))

vi.mock("@/lib/RAG/chroma", () => ({
  deleteRagDocumentsForNote: mockDeleteRagDocumentsForNote,
  upsertRagDocuments: mockUpsertRagDocuments,
}))

vi.mock("@/lib/RAG/chunk", () => ({
  chunkNote: mockChunkNote,
  chunkDocumentId: mockChunkDocumentId,
}))

import { deleteNoteChunks, ingestNote } from "@/lib/RAG/ingest"
import type { RagChunkMetadata } from "@/lib/RAG/types"

const baseInput = {
  id: "note-1",
  title: "Test note",
  content: "Some content.",
  notebookId: "nb-1",
  userId: "user-1",
}

const sampleMetadata: RagChunkMetadata = {
  userId: "user-1",
  noteId: "note-1",
  chunkIndex: 0,
  title: "Test note",
  notebookId: "nb-1",
}

function sampleDocument(chunkIndex = 0) {
  return new Document({
    pageContent: `chunk ${chunkIndex}`,
    metadata: { ...sampleMetadata, chunkIndex },
  })
}

describe("ingestNote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChunkNote.mockResolvedValue([sampleDocument()])
  })

  it("deletes existing chunks for the note before chunking", async () => {
    await ingestNote(baseInput)

    expect(mockDeleteRagDocumentsForNote).toHaveBeenCalledWith("note-1")
    expect(mockDeleteRagDocumentsForNote).toHaveBeenCalledBefore(mockChunkNote)
  })

  it("chunks with note fields mapped from ingest input", async () => {
    await ingestNote(baseInput)

    expect(mockChunkNote).toHaveBeenCalledWith({
      userId: "user-1",
      noteId: "note-1",
      notebookId: "nb-1",
      title: "Test note",
      content: "Some content.",
    })
  })

  it("does not upsert when chunking returns no documents", async () => {
    mockChunkNote.mockResolvedValue([])

    await ingestNote({ ...baseInput, title: "", content: "" })

    expect(mockUpsertRagDocuments).not.toHaveBeenCalled()
  })

  it("upserts chunked documents with stable chunk ids", async () => {
    const docs = [sampleDocument(0), sampleDocument(1)]
    mockChunkNote.mockResolvedValue(docs)

    await ingestNote(baseInput)

    expect(mockChunkDocumentId).toHaveBeenCalledWith("note-1", 0)
    expect(mockChunkDocumentId).toHaveBeenCalledWith("note-1", 1)
    expect(mockUpsertRagDocuments).toHaveBeenCalledWith(docs, [
      "note-1:0",
      "note-1:1",
    ])
    expect(mockUpsertRagDocuments).toHaveBeenCalledAfter(mockChunkNote)
  })

  it("runs delete, then chunk, then upsert in order", async () => {
    const order: string[] = []

    mockDeleteRagDocumentsForNote.mockImplementation(async () => {
      order.push("delete")
    })
    mockChunkNote.mockImplementation(async () => {
      order.push("chunk")
      return [sampleDocument()]
    })
    mockUpsertRagDocuments.mockImplementation(async () => {
      order.push("upsert")
    })

    await ingestNote(baseInput)

    expect(order).toEqual(["delete", "chunk", "upsert"])
  })

  it("is idempotent: re-ingest deletes then upserts with the same stable chunk ids", async () => {
    const docs = [sampleDocument(0), sampleDocument(1)]
    mockChunkNote.mockResolvedValue(docs)

    await ingestNote(baseInput)
    await ingestNote(baseInput)

    expect(mockDeleteRagDocumentsForNote).toHaveBeenCalledTimes(2)
    expect(mockDeleteRagDocumentsForNote).toHaveBeenNthCalledWith(1, "note-1")
    expect(mockDeleteRagDocumentsForNote).toHaveBeenNthCalledWith(2, "note-1")

    expect(mockUpsertRagDocuments).toHaveBeenCalledTimes(2)
    expect(mockUpsertRagDocuments).toHaveBeenNthCalledWith(1, docs, [
      "note-1:0",
      "note-1:1",
    ])
    expect(mockUpsertRagDocuments).toHaveBeenNthCalledWith(2, docs, [
      "note-1:0",
      "note-1:1",
    ])
  })
})

describe("deleteNoteChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("delegates to deleteRagDocumentsForNote", async () => {
    await deleteNoteChunks("note-99")

    expect(mockDeleteRagDocumentsForNote).toHaveBeenCalledTimes(1)
    expect(mockDeleteRagDocumentsForNote).toHaveBeenCalledWith("note-99")
  })
})
