"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Note, Notebook } from "@/lib/types/api";

interface NotesPanelProps {
    selectedNotebookId: string | null;
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    refetchKey: number
    notebooks: Notebook[] | null
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
}

export function NotesPanel ({
    selectedNotebookId,
    setSelectedNoteId,
    refetchKey,
    notebooks,
    notes,
    setNotes
    }: NotesPanelProps){

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedNotebookTitle, setSelectedNotebookTitle] = useState('')


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
            setSelectedNoteId(parsed.data[0].id)
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

        fetchNotes(selectedNotebookId, signal)
        return () => controller.abort()
    }, [selectedNotebookId, refetchKey, notebooks])

    if(!selectedNotebookId){
        return  (
        <p>No notebook currently selected</p>
        )
    }

    return(
        <div className="pl-4 pt-4 w-[12vw]">
            <button
                className="border-2 border-green-500 text-green-500 rounded-md w-[100px] mt-4 "
                onClick={() => {
                    setSelectedNoteId(null)
                }}>
                New Note
            </button>
            <div
            className="mt-4">
                {selectedNotebookTitle.length > 0 && (
                    <p>{selectedNotebookTitle}</p>
                    )}
            </div>
            <ul>
                { notes.length > 0 ? (
                    notes.map(note => (
                        <li key={note.id}>
                            <button
                                className="border-1 border-white rounded-md w-[100px] mt-4"
                                onClick={() => {
                                    setSelectedNoteId(note.id)
                                }}
                                >
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