import type { Note } from "@/lib/types/api"
import { NoteCard, type NoteCardRenderProps } from "./NoteCard"

type NoteDragOverlayProps = NoteCardRenderProps & {
    note: Note
    isSelected: boolean
}

export function NoteDragOverlay({
    note,
    isSelected,
    renderNotePreview,
    renderNoteUpdatedTime,
}: NoteDragOverlayProps) {
    return (
        <NoteCard
            note={note}
            isSelected={isSelected}
            variant="overlay"
            renderNotePreview={renderNotePreview}
            renderNoteUpdatedTime={renderNoteUpdatedTime}
        />
    )
}
