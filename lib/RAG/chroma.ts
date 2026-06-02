import "server-only"

import { Document } from "@langchain/core/documents"
import { OpenAIEmbeddings } from "@langchain/openai"
import { ChromaClient } from "chromadb"

import type {
  RagChunkMetadata,
  RagQueryInput,
  RagQueryResult,
} from "@/lib/RAG/types"

export const RAG_EMBEDDING_MODEL = "text-embedding-3-small"
export const RAG_EMBEDDING_DIMENSIONS = 1536
export const RAG_TOP_K_DEFAULT = 5

const DEFAULT_CHROMA_URL = "http://localhost:8000"
const DEFAULT_CHROMA_COLLECTION = "nevernote-dev"
/** Stored on the collection for identification (BYO OpenAI embeddings). */
const RAG_COLLECTION_SCHEMA_VERSION = "byo-v1"

let chromaClient: ChromaClient | null = null
let collectionPromise: ReturnType<ChromaClient["getOrCreateCollection"]> | null =
  null
let embeddings: OpenAIEmbeddings | null = null

export function getChromaUrl(): string {
  return process.env.CHROMA_URL ?? DEFAULT_CHROMA_URL
}

export function getChromaCollectionName(): string {
  return process.env.CHROMA_COLLECTION ?? DEFAULT_CHROMA_COLLECTION
}

export function getRagEmbeddings(): OpenAIEmbeddings {
  if (embeddings) {
    return embeddings
  }

  embeddings = new OpenAIEmbeddings({
    model: RAG_EMBEDDING_MODEL,
    dimensions: RAG_EMBEDDING_DIMENSIONS,
  })

  return embeddings
}

function getChromaClient(): ChromaClient {
  if (chromaClient) {
    return chromaClient
  }

  const url = new URL(getChromaUrl())
  const port =
    url.port !== ""
      ? Number(url.port)
      : url.protocol === "https:"
        ? 443
        : 80

  chromaClient = new ChromaClient({
    host: url.hostname,
    port,
    ssl: url.protocol === "https:",
  })
  return chromaClient
}

async function initRagCollection() {
  const client = getChromaClient()
  const name = getChromaCollectionName()

  return client.getOrCreateCollection({
    name,
    embeddingFunction: null,
    metadata: { rag_schema_version: RAG_COLLECTION_SCHEMA_VERSION },
  })
}

export async function getRagCollection() {
  collectionPromise ??= initRagCollection()
  return collectionPromise
}

/**
 * Upsert already-chunked documents into Chroma.
 * `ids` should align with documents 1:1 (e.g. `{noteId}:{chunkIndex}`).
 */
export async function upsertRagDocuments(
  documents: Array<Document<RagChunkMetadata>>,
  ids: string[]
): Promise<void> {
  if (documents.length === 0) {
    return
  }
  if (documents.length !== ids.length) {
    throw new Error(
      `upsertRagDocuments: ids length (${ids.length}) does not match documents length (${documents.length})`
    )
  }

  const collection = await getRagCollection()
  const embeddingClient = getRagEmbeddings()

  const pageContents = documents.map((doc) => doc.pageContent)
  const metadatas = documents.map((doc) => doc.metadata)
  const vectors = await embeddingClient.embedDocuments(pageContents)

  await collection.upsert({
    ids,
    documents: pageContents,
    metadatas,
    embeddings: vectors,
  })
}

/** Delete all chunks for a note (optionally scoped by userId). */
export async function deleteRagDocumentsForNote(
  noteId: string,
): Promise<void> {
  const collection = await getRagCollection()

  await collection.delete({
    where: { noteId: { $eq: noteId } },
  })
}

/** Delete a list of specific chunk ids. */
export async function deleteRagDocumentsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return
  }
  const collection = await getRagCollection()
  await collection.delete({ ids })
}

export async function queryRagSimilarChunks(
  input: RagQueryInput
): Promise<RagQueryResult[]> {
  const collection = await getRagCollection()
  const embeddingClient = getRagEmbeddings()
  const k = input.k ?? RAG_TOP_K_DEFAULT

  const queryEmbedding = await embeddingClient.embedQuery(input.query)
  const where: Record<string, unknown> = input.notebookId
    ? {
        $and: [
          { userId: { $eq: input.userId } },
          { notebookId: { $eq: input.notebookId } },
        ],
      }
    : { userId: { $eq: input.userId } }

  const response = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: k,
    where: where as Parameters<typeof collection.query>[0]["where"],
    include: ["documents", "metadatas", "distances"],
  })

  const ids = response.ids?.[0] ?? []
  const docs = response.documents?.[0] ?? []
  const metadatas = response.metadatas?.[0] ?? []
  const distances = response.distances?.[0] ?? []

  return ids.map((id, index) => ({
    id,
    text: docs[index] ?? "",
    metadata: metadatas[index] as RagChunkMetadata,
    distance: distances[index] ?? null,
  }))
}
