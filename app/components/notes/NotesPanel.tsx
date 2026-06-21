"use client"

import { useEffect, useState, Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { Note, Notebook } from "@/lib/types/api";
import { initializeNote } from "@/app/lib/InitializeNote";
import { htmlToPlainText } from "@/app/lib/format/htmlToPlainText";
import { SortNotesButton } from "./SortNotesButton";
import { SortableNoteItem } from "./SortableNoteItem";
import { NoteDragOverlay } from "./NoteDragOverlay";
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
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

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