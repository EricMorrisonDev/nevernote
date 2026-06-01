import "server-only"

import { deleteRagDocumentsForNote, upsertRagDocuments } from "./chroma";
import { chunkNote, chunkDocumentId } from "./chunk";
import type { Note } from "../types/api";

export async function ingestNote(note: Note): Promise<void>{

    const {
        userId,
        id,
        notebookId,
        title,
        content
    } = note

    await deleteRagDocumentsForNote(id, userId)
    const documents = await chunkNote({ userId, noteId: id, notebookId, title, content })
    if(documents.length === 0) return
    const documentIds = documents.map(doc => {
        return chunkDocumentId(doc.metadata.noteId, doc.metadata.chunkIndex)
    })

    await upsertRagDocuments(documents, documentIds)

}

export async function deleteNoteChunks(
    noteId: string,
    userId?: string
  ): Promise<void> {
    await deleteRagDocumentsForNote(noteId, userId)
  }