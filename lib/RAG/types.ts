/** Input for chunking a single note before embedding. */
export type NoteChunkInput = {
  userId: string
  noteId: string
  notebookId: string
  title: string
  content: string
}

/** Stored on every Chroma / LangChain document (see Implementation_roadmap). */
export type RagChunkMetadata = {
  userId: string
  noteId: string
  chunkIndex: number
  title: string
  notebookId: string
}
