import { Document } from "@langchain/core/documents"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const {
  mockUpsert,
  mockDelete,
  mockQuery,
  mockGetOrCreateCollection,
  mockEmbedDocuments,
  mockEmbedQuery,
} = vi.hoisted(() => ({
  mockUpsert: vi.fn().mockResolvedValue(undefined),
  mockDelete: vi.fn().mockResolvedValue(undefined),
  mockQuery: vi.fn(),
  mockGetOrCreateCollection: vi.fn(),
  mockEmbedDocuments: vi.fn(),
  mockEmbedQuery: vi.fn(),
}))

const mockCollection = {
  upsert: mockUpsert,
  delete: mockDelete,
  query: mockQuery,
}

vi.mock("chromadb", () => ({
  ChromaClient: vi.fn(function ChromaClient() {
    return { getOrCreateCollection: mockGetOrCreateCollection }
  }),
}))

vi.mock("@langchain/openai", () => ({
  OpenAIEmbeddings: vi.fn(function OpenAIEmbeddings() {
    return {
      embedDocuments: mockEmbedDocuments,
      embedQuery: mockEmbedQuery,
    }
  }),
}))

import {
  deleteRagDocumentsByIds,
  deleteRagDocumentsForNote,
  getChromaCollectionName,
  getChromaUrl,
  getRagCollection,
  queryRagSimilarChunks,
  RAG_TOP_K_DEFAULT,
  upsertRagDocuments,
} from "@/lib/RAG/chroma"
import type { RagChunkMetadata } from "@/lib/RAG/types"

const sampleMetadata: RagChunkMetadata = {
  userId: "user-1",
  noteId: "note-1",
  chunkIndex: 0,
  title: "My note",
  notebookId: "nb-1",
}

function sampleDocument(pageContent = "Title: My note\n\nHello world") {
  return new Document({ pageContent, metadata: sampleMetadata })
}

describe("getChromaUrl", () => {
  const original = process.env.CHROMA_URL

  afterEach(() => {
    if (original === undefined) {
      delete process.env.CHROMA_URL
    } else {
      process.env.CHROMA_URL = original
    }
  })

  it("returns default when env is unset", () => {
    delete process.env.CHROMA_URL
    expect(getChromaUrl()).toBe("http://localhost:8000")
  })

  it("returns env value when set", () => {
    process.env.CHROMA_URL = "http://custom:9000"
    expect(getChromaUrl()).toBe("http://custom:9000")
  })
})

describe("getChromaCollectionName", () => {
  const original = process.env.CHROMA_COLLECTION

  afterEach(() => {
    if (original === undefined) {
      delete process.env.CHROMA_COLLECTION
    } else {
      process.env.CHROMA_COLLECTION = original
    }
  })

  it("returns default when env is unset", () => {
    delete process.env.CHROMA_COLLECTION
    expect(getChromaCollectionName()).toBe("nevernote-dev")
  })

  it("returns env value when set", () => {
    process.env.CHROMA_COLLECTION = "test-collection"
    expect(getChromaCollectionName()).toBe("test-collection")
  })
})

describe("getRagCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrCreateCollection.mockResolvedValue(mockCollection)
  })

  it("creates collection with BYO embeddings config", async () => {
    await getRagCollection()

    expect(mockGetOrCreateCollection).toHaveBeenCalledWith({
      name: getChromaCollectionName(),
      embeddingFunction: null,
      metadata: { rag_schema_version: "byo-v1" },
    })
  })
})

describe("upsertRagDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrCreateCollection.mockResolvedValue(mockCollection)
    mockEmbedDocuments.mockResolvedValue([[0.1, 0.2], [0.3, 0.4]])
  })

  it("does nothing when documents array is empty", async () => {
    await upsertRagDocuments([], [])

    expect(mockEmbedDocuments).not.toHaveBeenCalled()
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it("throws when ids and documents lengths differ", async () => {
    await expect(
      upsertRagDocuments([sampleDocument()], ["note-1:0", "note-1:1"])
    ).rejects.toThrow(/does not match documents length/)
  })

  it("embeds page content and upserts to collection", async () => {
    const docs = [sampleDocument("chunk one"), sampleDocument("chunk two")]
    const ids = ["note-1:0", "note-1:1"]

    await upsertRagDocuments(docs, ids)

    expect(mockEmbedDocuments).toHaveBeenCalledWith(["chunk one", "chunk two"])
    expect(mockUpsert).toHaveBeenCalledWith({
      ids,
      documents: ["chunk one", "chunk two"],
      metadatas: [sampleMetadata, sampleMetadata],
      embeddings: [[0.1, 0.2], [0.3, 0.4]],
    })
  })
})

describe("deleteRagDocumentsForNote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrCreateCollection.mockResolvedValue(mockCollection)
  })

  it("deletes with Chroma 3 $eq filter on noteId", async () => {
    await deleteRagDocumentsForNote("note-abc")

    expect(mockDelete).toHaveBeenCalledWith({
      where: { noteId: { $eq: "note-abc" } },
    })
  })
})

describe("deleteRagDocumentsByIds", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrCreateCollection.mockResolvedValue(mockCollection)
  })

  it("does nothing when ids array is empty", async () => {
    await deleteRagDocumentsByIds([])

    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("deletes by chunk ids", async () => {
    await deleteRagDocumentsByIds(["note-1:0", "note-1:1"])

    expect(mockDelete).toHaveBeenCalledWith({
      ids: ["note-1:0", "note-1:1"],
    })
  })
})

describe("queryRagSimilarChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrCreateCollection.mockResolvedValue(mockCollection)
    mockEmbedQuery.mockResolvedValue([0.5, 0.6])
    mockQuery.mockResolvedValue({
      ids: [["note-1:0"]],
      documents: [["retrieved text"]],
      metadatas: [[sampleMetadata]],
      distances: [[0.42]],
    })
  })

  it("queries with userId filter only when notebookId omitted", async () => {
    await queryRagSimilarChunks({
      query: "what did I write?",
      userId: "user-1",
    })

    expect(mockEmbedQuery).toHaveBeenCalledWith("what did I write?")
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryEmbeddings: [[0.5, 0.6]],
        nResults: RAG_TOP_K_DEFAULT,
        where: { userId: { $eq: "user-1" } },
        include: ["documents", "metadatas", "distances"],
      })
    )
  })

  it("queries with $and when notebookId is set", async () => {
    await queryRagSimilarChunks({
      query: "dogs",
      userId: "user-1",
      notebookId: "nb-1",
      k: 3,
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        nResults: 3,
        where: {
          $and: [
            { userId: { $eq: "user-1" } },
            { notebookId: { $eq: "nb-1" } },
          ],
        },
      })
    )
  })

  it("maps Chroma response rows to RagQueryResult", async () => {
    const results = await queryRagSimilarChunks({
      query: "test",
      userId: "user-1",
    })

    expect(results).toEqual([
      {
        id: "note-1:0",
        text: "retrieved text",
        metadata: sampleMetadata,
        distance: 0.42,
      },
    ])
  })

  it("returns empty array when query has no matches", async () => {
    mockQuery.mockResolvedValue({
      ids: [[]],
      documents: [[]],
      metadatas: [[]],
      distances: [[]],
    })

    const results = await queryRagSimilarChunks({
      query: "nothing here",
      userId: "user-1",
    })

    expect(results).toEqual([])
  })
})
