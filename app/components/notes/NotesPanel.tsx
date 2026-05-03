"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Note, Notebook } from "@/lib/types/api";
import { initializeNote } from "@/app/lib/InitializeNote";
import type { RefetchNotesState } from "@/app/lib/types";
import type { HistoryEntry } from "@/lib/useNoteHistory";

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
    const refetchReason = refetchNotes.reason

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

    const htmlToPlainText = (html: string) => {
        const el = document.createElement("div")
        el.innerHTML = html;
        return (el.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    }

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

    if(!selectedNotebookId){
        return  (
        <p className="text-muted">No notebook currently selected</p>
        )
    }

    // remember to wire up the delete button with the new modal

    return(
        <div className="h-full w-full min-h-0 flex flex-col">
            <div className="flex justify-between pr-6 items-end mb-2">
                <div
                className="mt-4">
                    {selectedNotebookTitle.length > 0 && (
                        <p className="text-[2rem] text-bold">{selectedNotebookTitle}</p>
                    )}
                </div>
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
            <ul className="flex-1 min-h-0 overflow-y-auto scrollbar-hide grid grid-cols-2 gap-4 content-start">
                { notes.length > 0 && (
                    notes.map(note => (
                        <li key={note.id}
                            className="max-w-[200px]">
                            <button
                                className={note.id === selectedNoteId ? 
                                    "bg-surface border border-accent/60 ring-1 ring-ring rounded-xl p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2 hover:bg-surface-2" : 
                                    "bg-surface border border-border rounded-xl min-w-[100px] p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2 hover:bg-surface-2"}
                                onClick={() => {
                                    setSelectedNoteId(note.id)
                                    recordVisit({
                                        noteId: note.id,
                                        notebookId: selectedNotebookId,
                                        stackId: openStackId || undefined,
                                    })
                                }}
                                >
                                    <p className="font-bold text-base pl-2">
                                        {note.title.trim().length === 0 ? 'Untitled' : note.title}
                                    </p>
                                    <p className="text-sm text-muted p-2">
                                        {renderNotePreview(note.content)}
                                    </p>
                                    <p className="mt-auto text-xs text-muted/80">
                                        {renderNoteUpdatedTime(note.updatedAt)}
                                    </p>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}