"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Note, Notebook } from "@/lib/types/api";
import { initializeNote } from "@/app/lib/InitializeNote";
import type { RefetchReason, RefetchNotesState } from "@/app/lib/types";


interface NotesPanelProps {
    selectedNotebookId: string | null;
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNoteId: string | null
    refetchNotes: RefetchNotesState,
    setRefetchNotes: Dispatch<SetStateAction<RefetchNotesState>>
    notebooks: Notebook[] | null
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
    modalTitle: string,
    setModalTitle: Dispatch<SetStateAction<string>>
}

export function NotesPanel ({
    selectedNotebookId,
    setSelectedNoteId,
    selectedNoteId,
    refetchNotes,
    setRefetchNotes,
    notebooks,
    notes,
    setNotes,
    modalTitle,
    setModalTitle
    }: NotesPanelProps){

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedNotebookTitle, setSelectedNotebookTitle] = useState('')


    const fetchNotes = async(
        selectedNotebookId: string | null, 
        refetchNotes: RefetchNotesState,
        signal?: AbortSignal,
        ) => {

        if(!selectedNotebookId) return

        try {
            console.log('fetching notes')
            setError(false)
            setLoading(true)
            setNotes([])
            const params = new URLSearchParams({ notebookId: selectedNotebookId })
            const result = await fetch(`/api/notes?${params.toString()}`, {
                signal
            })
            if(!result.ok){
                throw new Error('Failed to retrieve notes')
            }
            const parsed = await result.json()
            if(!Array.isArray(parsed.data)){
                throw new Error('Invalid data type')
            }
            setNotes(parsed.data)

            if(notes.length === 0){
                throw new Error('Notes array empty')
            }

            if(refetchNotes.reason === "notebook-change"){
                setSelectedNoteId(parsed.data[0].id)
            }
            
        } catch (err) {
            if(err instanceof DOMException && err.name === "AbortError"){
                return
            }
            console.error(err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if(selectedNotebookId && notebooks){
            const notebook = notebooks.find(notebook => notebook.id === selectedNotebookId)
            if(notebook){
                setSelectedNotebookTitle(notebook.title)
            } else {
                setSelectedNotebookTitle('')
            }
        } else {
            setSelectedNotebookTitle('')
        }

        fetchNotes(selectedNotebookId, refetchNotes, signal)
        return () => controller.abort()
    }, [selectedNotebookId, refetchNotes, notebooks])

    const renderNotePreview = (content: string) => {
        let preview = ''
        const limit = 150;
        const chars = content.split('')
        if(content.length <= limit) return content
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
        <p>No notebook currently selected</p>
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
                    className="border-2 border-green-500 text-green-500 rounded-md w-[100px] h-[40px]"
                    onClick={() => {
                        initializeNote(selectedNotebookId)
                        setRefetchNotes(prev => ({ key: prev.key + 1, reason: "note-created"}))
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
                                    "bg-black border-1 border-white rounded-md p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2" : 
                                    "bg-black rounded-md min-w-[100px] p-2 overflow-hidden h-[250px] w-full text-left flex flex-col items-start justify-start mt-2"}
                                onClick={() => {
                                    setSelectedNoteId(note.id)
                                }}
                                >
                                    <p className="font-bold text-base pl-2">
                                        {note.title.trim().length === 0 ? 'Untitled' : note.title}
                                    </p>
                                    <p className="text-sm text-gray-300 p-2">
                                        {renderNotePreview(note.content)}
                                    </p>
                                    <p className="mt-auto text-xs text-gray-400">
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