"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Note } from "@/lib/types/api"
import type { SortMode } from "@/app/lib/types"
import { NoteCard, type NoteCardRenderProps } from "./NoteCard"

type SortableNoteItemProps = NoteCardRenderProps & {
    note: Note
    isSelected: boolean
    sortMode: SortMode
    onSelect: () => void
}

export function SortableNoteItem({
    note,
    isSelected,
    onSelect,
    sortMode,
    renderNotePreview,
    renderNoteUpdatedTime,
}: SortableNoteItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: note.id,
    })

    const style = {
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
    }

    const isCustomSort = sortMode === "custom"

    return (
        <li ref={setNodeRef} style={style} className="max-w-[200px]">
            <NoteCard
                note={note}
                isSelected={isSelected}
                renderNotePreview={renderNotePreview}
                renderNoteUpdatedTime={renderNoteUpdatedTime}
                onClick={onSelect}
                {...(isCustomSort ? listeners : {})}
                {...(isCustomSort ? attributes : {})}
            />
        </li>
    )
}
