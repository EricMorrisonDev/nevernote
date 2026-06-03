import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { NextResponse } from "next/server"

import { requireUser } from "@/lib/session"
import { handleApiError } from "@/lib/errorResponse"
import { requireValidation } from "@/lib/zodValidation"
import { ensureNotebookBelongsToUser } from "@/lib/notebookMatch"
import { queryRagSimilarChunks } from "@/lib/RAG/chroma"

const RAG_CHAT_MODEL = "gpt-4o-mini"
const RAG_QUERY_K_DEFAULT = 5
const EXCERPT_MAX_CHARS = 240

const ragQueryBodySchema = z.object({
  query: z.string().trim().min(1),
  notebookId: z.string().min(1).optional(),
  k: z.number().int().min(1).max(10).optional(),
})

// these sources will describe each individual chunk the answer was based on
type RagQuerySource = {
  id: string
  noteId: string
  title: string
  notebookId: string
  chunkId: string
  excerpt: string
  distance: number | null
}

// this just formats text for use in citations if we want them in the chat
function toExcerpt(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= EXCERPT_MAX_CHARS) {
    return normalized
  }
  return `${normalized.slice(0, EXCERPT_MAX_CHARS)}...`
}

// this takes chunks and reformats them to make them more usable for the LLM
function buildContext(chunks: Awaited<ReturnType<typeof queryRagSimilarChunks>>): string {
  return chunks
    .map((chunk, index) => {
      return [
        `[${index + 1}]`,
        `noteId=${chunk.metadata.noteId}`,
        `title=${chunk.metadata.title}`,
        `notebookId=${chunk.metadata.notebookId}`,
        `text=${chunk.text}`,
      ].join("\n")
    })
    .join("\n\n")
}

// this takes returned chunks and maps them to the RagQuerySource shape defined above
function toSources(chunks: Awaited<ReturnType<typeof queryRagSimilarChunks>>): RagQuerySource[] {
  return chunks.map((chunk) => ({
    id: chunk.id,
    noteId: chunk.metadata.noteId,
    title: chunk.metadata.title,
    notebookId: chunk.metadata.notebookId,
    chunkId: chunk.id,
    excerpt: toExcerpt(chunk.text),
    distance: chunk.distance,
  }))
}

type RagQueryAuditLog = {
  queryId: string
  userId?: string
  latencyMs: number
  chunkIds: string[]
  emptyRetrieval: boolean
  notebookId?: string
  status: "ok" | "error"
  error?: string
}

/** Phase 2.3: audit metadata only — no query text or chunk bodies. */
function logRagQuery(event: RagQueryAuditLog): void {
  console.info("[rag.query]", JSON.stringify(event))
}

export async function POST(request: Request) {
  const queryId = crypto.randomUUID()
  const startedAt = Date.now()
  let userId: string | undefined

  try {
    const user = await requireUser()
    if (user instanceof NextResponse) return user
    userId = user.id

    // parse json and validate with zod
    const body = await request.json()
    const validated = requireValidation(ragQueryBodySchema, body)
    if (validated instanceof NextResponse) return validated


    const { query, notebookId, k } = validated.data

    // make sure notebook belongs to user
    if (notebookId) {
      const match = await ensureNotebookBelongsToUser(notebookId, user.id)
      if (match instanceof NextResponse) return match
    }

    // fetch relevant chunks from chroma
    const chunks = await queryRagSimilarChunks({
      query,
      userId: user.id,
      notebookId,
      k: k ?? RAG_QUERY_K_DEFAULT,
    })

    // if no relevant chunks, return error message
    if (chunks.length === 0) {
      logRagQuery({
        queryId,
        userId,
        latencyMs: Date.now() - startedAt,
        chunkIds: [],
        emptyRetrieval: true,
        notebookId,
        status: "ok",
      })

      return NextResponse.json(
        {
          data: {
            answer:
              "I couldn't find anything relevant in your indexed notes for that question.",
            sources: [] as RagQuerySource[],
          },
        },
        { status: 200 }
      )
    }

    // initialize llm client
    const llm = new ChatOpenAI({
      model: RAG_CHAT_MODEL,
    })

    // reformat chunks for llm
    const context = buildContext(chunks)

    // pass user query and context to llm with system prompt
    const response = await llm.invoke([
      {
        role: "system",
        content:
          "You answer questions using only the provided note excerpts. If the context is insufficient, say you don't know from the notes. Keep answers concise and factual.",
      },
      {
        role: "user",
        content: `Question:\n${query}\n\nContext:\n${context}`,
      },
    ])

    // trim whitespace off response
    const answer =
      typeof response.content === "string"
        ? response.content.trim()
        : response.text.trim()

    const sources = toSources(chunks)

    logRagQuery({
      queryId,
      userId,
      latencyMs: Date.now() - startedAt,
      chunkIds: sources.map((source) => source.chunkId),
      emptyRetrieval: false,
      notebookId,
      status: "ok",
    })

    return NextResponse.json(
      {
        data: {
          answer,
          sources,
        },
      },
      { status: 200 }
    )
  } catch (e) {
    logRagQuery({
      queryId,
      userId,
      latencyMs: Date.now() - startedAt,
      chunkIds: [],
      emptyRetrieval: false,
      status: "error",
      error: e instanceof Error ? e.message : "Unknown error",
    })
    return handleApiError(e)
  }
}