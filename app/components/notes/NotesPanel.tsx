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

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchNotes = async(selectedNotebookId: string | null) => {

            if(!selectedNotebookId){
                setLoading(false)
                setError(false)
                setNotes([])
                return () => controller.abort()
            }
            try {
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

        fetchNotes(selectedNotebookId)
        return () => controller.abort()
    }, [selectedNotebookId])

    return(
        <div className="">
            <div>
                <CreateNote 
                    selectedNotebookId={selectedNotebookId}
                />
            </div>
            <ul>
                {notes.length > 0 ? (
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
    )
}