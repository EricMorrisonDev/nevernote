import "server-only"

import { deleteRagDocumentsForNote, upsertRagDocuments } from "./chroma";
import { chunkNote, chunkDocumentId } from "./chunk";

type IngestInput = {
    id: string,
    title: string,
    content: string,
    notebookId: string,
    userId: string,
}

export async function ingestNote(input: IngestInput): Promise<void>{

    const {
        userId,
        id,
        notebookId,
        title,
        content
    } = input
 
    await deleteRagDocumentsForNote(id)
    const documents = await chunkNote({ userId, noteId: id, notebookId, title, content })
    if(documents.length === 0) return
    const documentIds = documents.map(doc => {
        return chunkDocumentId(doc.metadata.noteId, doc.metadata.chunkIndex)
    })

    await upsertRagDocuments(documents, documentIds)

}

export async function deleteNoteChunks(noteId: string): Promise<void> {
    await deleteRagDocumentsForNote(noteId)
  }