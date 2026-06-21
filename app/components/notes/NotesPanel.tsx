"use client"

import { useEffect, useState, Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { Note, Notebook } from "@/lib/types/api";
import { initializeNote } from "@/app/lib/InitializeNote";
import { htmlToPlainText } from "@/app/lib/format/htmlToPlainText";
import { SortNotesButton } from "./SortNotesButton";
import { computeCustomOrderAfterMove } from "@/app/lib/customOrder";
import type { RefetchNotesState, SortMode } from "@/app/lib/types";
import type { HistoryEntry } from "@/lib/useNoteHistory";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragOverlay,
    defaultDropAnimation,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";




interface NotesPanelProps {
    selectedNotebookId: string | null;
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNoteId: string | null
    openStackId: string
    recordVisit: (entry: HistoryEntry) => void
    refetchNotes: RefetchNotesState,
    setRefetchNotes: Dispatch<SetStateAction<RefetchNotesState>>
    notebooks: Notebook[] | null
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
}

type NoteDragOverlayProps = {
    note: Note
    isSelected: boolean
    renderNotePreview: (content: string) => string
    renderNoteUpdatedTime: (time: string) => string
}

// this is a functional component that renders a copy of a note tile
function NoteDragOverlay({
    note,
    isSelected,
    renderNotePreview,
    renderNoteUpdatedTime,
}: NoteDragOverlayProps) {
    return (
        <div
            className={
                isSelected
                    ? "max-w-[200px] w-full cursor-grabbing rounded-xl border border-accent/60 bg-surface p-2 shadow-lg ring-1 ring-ring"
                    : "max-w-[200px] w-full cursor-grabbing rounded-xl border border-border bg-surface p-2 shadow-lg"
            }
            style={{ height: 250 }}
        >
            <div className="flex h-full min-h-0 w-full flex-col items-start text-left">
                <div className="flex w-full shrink-0 items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate pl-2 text-base font-bold">
                        {note.title.trim().length === 0 ? "Untitled" : note.title}
                    </p>
                    
                </div>
                <p className="min-h-0 flex-1 overflow-hidden p-2 text-sm text-muted">
                    {renderNotePreview(note.content)}
                </p>
                <p className="mt-auto shrink-0 text-xs text-muted/80">
                    {renderNoteUpdatedTime(note.updatedAt)}
                </p>
            </div>
        </div>
    )
}

type SortableNoteItemProps = {
    note: Note
    isSelected: boolean
    sortMode: string
    onSelect: () => void
    renderNotePreview: (content: string) => string
    renderNoteUpdatedTime: (time: string) => string
}

// this renders the actual notes that we see in the ui
function SortableNoteItem({
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
            <div
                className={
                    isSelected
                        ? "cursor-default bg-surface border border-accent/60 ring-1 ring-ring rounded-xl p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2 hover:bg-surface-2"
                        : "cursor-default bg-surface border border-border rounded-xl min-w-[100px] p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2 hover:bg-surface-2"
                }
                onClick={onSelect}
                {...(isCustomSort ? listeners : {})}
                {...(isCustomSort ? attributes : {})}
            >
                        <div className="flex w-full items-center justify-between gap-2">
                            <p className="min-w-0 flex-1 truncate pl-2 text-base font-bold">
                                {note.title.trim().length === 0 ? "Untitled" : note.title}
                            </p>
                        </div>
                        <p className="text-sm text-muted p-2">{renderNotePreview(note.content)}</p>
                        <p className="mt-auto text-xs text-muted/80">{renderNoteUpdatedTime(note.updatedAt)}</p>
                    
            </div>
        </li>
    )
}

export function NotesPanel ({
    selectedNotebookId,
    setSelectedNoteId,
    selectedNoteId,
    openStackId,
    recordVisit,
    refetchNotes,
    setRefetchNotes,
    notebooks,
    notes,
    setNotes,
    }: NotesPanelProps){

    const [selectedNotebookTitle, setSelectedNotebookTitle] = useState('')
    const [sortMenuOpen, setSortMenuOpen] = useState(false)
    const [sortMode, setSortMode] = useState<SortMode>('created')
    const [activeDragNoteId, setActiveDragNoteId] = useState<string | null>(null)
    const refetchReason = refetchNotes.reason

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    )

    // This grabs the notebook title for the currently selected notebook and updates state
    useEffect(() => {
        if (selectedNotebookId && notebooks) {
            const notebook = notebooks.find((nb) => nb.id === selectedNotebookId)
            if (notebook) {
                setSelectedNotebookTitle(notebook.title)
            } else {
                setSelectedNotebookTitle('')
            }
        } else {
            setSelectedNotebookTitle('')
        }
    }, [selectedNotebookId, notebooks])

    // This fetches notes and updates notes array state
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if (!selectedNotebookId) {
            return () => controller.abort()
        }

        ;(async () => {
            try {
                const params = new URLSearchParams({ notebookId: selectedNotebookId })
                const result = await fetch(`/api/notes?${params.toString()}`, {
                    signal,
                })
                if (!result.ok) {
                    throw new Error('Failed to retrieve notes')
                }
                const parsed = await result.json()
                if (!Array.isArray(parsed.data)) {
                    throw new Error('Invalid data type')
                }
                setNotes(parsed.data)

                if (
                    refetchReason === "searchHit-note-selected" ||
                    refetchReason === "history-apply"
                ) {
                    return
                }

                if (refetchReason === 'notebook-change') {
                    const firstId = parsed.data[0]?.id ?? null
                    setSelectedNoteId(firstId)
                    if (firstId && selectedNotebookId) {
                        recordVisit({
                            noteId: firstId,
                            notebookId: selectedNotebookId,
                            stackId: openStackId || undefined,
                        })
                    }
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return
                }
                console.error(err)
            }
        })()

        return () => controller.abort()
    }, [selectedNotebookId, refetchNotes.key, refetchReason, setNotes, setSelectedNoteId, recordVisit, openStackId])

    // this renders the preview text in the note tile, converting html to plain text first
    const renderNotePreview = (content: string) => {
        const plain = htmlToPlainText(content)
        let preview = ''
        const limit = 150;
        const chars = plain.split('')
        if(chars.length <= limit) return plain
        for(let i = 0; i < limit; i++){
            preview += chars[i]
        }
        preview += '...'
        return preview
    }

    // this renders the updated at time shown at the bottom of the note tile
    const renderNoteUpdatedTime = (time: string) => {
        const timeDiff = (new Date().getTime()) - (new Date(time).getTime())

        if(timeDiff / (1000 * 60 * 60 * 24) >= 1){
            return new Date(time).toLocaleDateString()
        } else if (timeDiff / (1000 * 60 * 60) >= 1) {
            return `${Math.floor(timeDiff / (1000 * 60 * 60))} hours ago`
        } else if(timeDiff / (1000 * 60) >= 1) {
            return `${Math.floor(timeDiff / (1000 * 60))} mins ago`
        } else {
            return 'just now'
        }
    }

    const sortNotes = useCallback((mode: SortMode): Note[] => {
        if (!notes || notes.length === 0) {
            return []
        }

        switch (mode) {
            case "created":
                return [...notes].sort((a, b) =>
                    b.createdAt.localeCompare(a.createdAt)
                )

            case "updated":
                return [...notes].sort((a, b) =>
                    b.updatedAt.localeCompare(a.updatedAt)
                )

            case "alpha":
                return [...notes].sort((a, b) =>
                    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
                )

            case "size":
                return [...notes].sort((a, b) =>
                    b.content.length - a.content.length
                )

            case "custom":
                return [...notes].sort((a, b) => {
                    const orderDiff = a.customOrder - b.customOrder
                    if (orderDiff !== 0) return orderDiff
                    // if a and b are the same, sort by created at
                    const createdDiff = a.createdAt.localeCompare(b.createdAt)
                    if (createdDiff !== 0) return createdDiff
                    // if created at are the same, sort by id
                    return a.id.localeCompare(b.id)
                })
        }
    }, [notes])

    const sortedNotes = useMemo(() => sortNotes(sortMode), [sortNotes, sortMode])

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragNoteId(String(event.active.id))
    }, [])

    const handleDragCancel = useCallback(() => {
        setActiveDragNoteId(null)
    }, [])

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event

            // if note was not dropped on a valid target or it was dropped on its original position, return
            if (!over || active.id === over.id) {
                setActiveDragNoteId(null)
                return
            }


            const ids = sortedNotes.map((n) => n.id)
            const oldIndex = ids.indexOf(String(active.id))
            const newIndex = ids.indexOf(String(over.id))
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                setActiveDragNoteId(null)
                return
            }

            const newIds = arrayMove(ids, oldIndex, newIndex)
            const byId = new Map(notes.map((n) => [n.id, n]))
            const reorderedNotes = newIds.map((id) => byId.get(id)).filter(Boolean) as Note[]

            const movedId = String(active.id)
            const movedIdx = newIds.indexOf(movedId)
            const afterId = movedIdx > 0 ? newIds[movedIdx - 1] : undefined
            const beforeId = movedIdx < newIds.length - 1 ? newIds[movedIdx + 1] : undefined

            const newCustomOrder = computeCustomOrderAfterMove(afterId, beforeId, byId)
            if (newCustomOrder === null) {
                setActiveDragNoteId(null)
                return
            }

            const previousNotes = notes.map((n) => ({ ...n }))
            const previousSortMode = sortMode

            setNotes(
                reorderedNotes.map((n) =>
                    n.id === movedId ? { ...n, customOrder: newCustomOrder } : n
                )
            )

            queueMicrotask(() => {
                setActiveDragNoteId(null)
            })

            const body: { afterId?: string; beforeId?: string } = {}
            if (afterId) body.afterId = afterId
            if (beforeId) body.beforeId = beforeId

            try {
                const res = await fetch(`/api/notes/${movedId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
                if (!res.ok) {
                    console.error("Reorder failed", await res.text())
                    setNotes(previousNotes)
                    setSortMode(previousSortMode)
                    return
                }
                const parsed = (await res.json()) as {
                    data: Note
                    rebalanced?: boolean
                    notes?: Note[]
                }
                if (parsed.rebalanced && parsed.notes) {
                    setNotes(parsed.notes)
                    return
                }
                const updated = parsed.data
                setNotes((prev) =>
                    prev.map((n) =>
                        n.id === movedId ? { ...n, customOrder: updated.customOrder } : n
                    )
                )
            } catch (e) {
                console.error(e)
                setNotes(previousNotes)
                setSortMode(previousSortMode)
            }
        },
        [notes, sortMode, sortedNotes, setNotes, setSortMode]
    )

    const activeDragNote = useMemo(() => {
        if (!activeDragNoteId) return null
        return notes.find((n) => n.id === activeDragNoteId) ?? null
    }, [notes, activeDragNoteId])

    if(!selectedNotebookId){
        return  (
        <p className="text-muted">No notebook currently selected</p>
        )
    }

    return(
        <div className="h-full w-full min-h-0 flex flex-col">
            <div className="flex justify-between pr-6 items-end mb-2">
                <div
                className="mt-4">
                    {selectedNotebookTitle.length > 0 && (
                        <p className="text-[1rem] text-bold">{selectedNotebookTitle}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <SortNotesButton
                        sortMenuOpen={sortMenuOpen}
                        setSortMenuOpen={setSortMenuOpen}
                        onSelectSort={(mode) => {
                            setSortMode(mode)
                            setSortMenuOpen(false)
                        }}
                    />
                    <button
                        className="rounded-lg border border-control-border bg-control-surface px-3 py-2 text-sm font-medium text-control hover:bg-control-surface-hover"
                        onClick={async () => {
                            const result = await initializeNote(selectedNotebookId)
                            setRefetchNotes(prev => ({ key: prev.key + 1, reason: "note-created"}))
                            const newNoteId = result?.id
                            if (newNoteId) {
                                setSelectedNoteId(newNoteId)
                                recordVisit({
                                    noteId: newNoteId,
                                    notebookId: selectedNotebookId,
                                    stackId: openStackId || undefined,
                                })
                            }
                        }}>
                        + Note
                    </button>
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragCancel={handleDragCancel}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sortedNotes.map((n) => n.id)}
                    strategy={rectSortingStrategy}
                >
                    <ul className="flex-1 min-h-0 overflow-y-auto scrollbar-hide grid grid-cols-2 gap-4 content-start">
                        {notes.length > 0 &&
                            sortedNotes.map((note) => (
                                <SortableNoteItem
                                    key={note.id}
                                    note={note}
                                    sortMode={sortMode}
                                    isSelected={note.id === selectedNoteId}
                                    onSelect={() => {
                                        setSelectedNoteId(note.id)
                                        recordVisit({
                                            noteId: note.id,
                                            notebookId: selectedNotebookId,
                                            stackId: openStackId || undefined,
                                        })
                                    }}
                                    renderNotePreview={renderNotePreview}
                                    renderNoteUpdatedTime={renderNoteUpdatedTime}
                                />
                            ))}
                    </ul>
                </SortableContext>
                <DragOverlay dropAnimation={defaultDropAnimation}>
                    {activeDragNote ? (
                        <NoteDragOverlay
                            note={activeDragNote}
                            isSelected={activeDragNote.id === selectedNoteId}
                            renderNotePreview={renderNotePreview}
                            renderNoteUpdatedTime={renderNoteUpdatedTime}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}