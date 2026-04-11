"use client"

import { useEffect, useState } from "react";
import { Note } from "@/lib/types/api";
import { CreateNote } from "./CreateNote";

interface NotesPanelProps {
    selectedNotebookId: string | null;
    selectedNoteId: string | null;
    onSelectNote: (id: string) => void
}

export function NotesPanel ({
    selectedNotebookId,
    selectedNoteId,
    onSelectNote
    }: NotesPanelProps){

    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)


    const fetchNotes = async(selectedNotebookId: string | null, signal?: AbortSignal) => {

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

    const onCreateNote = () => {
        fetchNotes(selectedNotebookId)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        fetchNotes(selectedNotebookId, signal)
        return () => controller.abort()
    }, [selectedNotebookId])

    if(!selectedNotebookId){
        return  (
        <p>No notebook currently selected</p>
        )
    }

    return(
        <div className="">
            <div>
                
            </div>
            <div className="pl-4">
                <ul>
                    { !selectedNotebookId ? (
                        <p>No notebook currently selected</p>
                    ) : notes.length > 0 ? (
                        notes.map(note => (
                            <li key={note.id}>
                                <button>
                                    {note.title}
                                </button>
                            </li>
                        ))
                    ) : notes.length === 0 && loading ? (
                        <p>Loading...</p>
                    ) : (
                        <p>Notebook currently empty</p>
                    )}
                </ul>
            </div>

        </div>
    )
}