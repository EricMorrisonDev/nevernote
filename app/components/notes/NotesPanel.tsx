"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Note, Notebook } from "@/lib/types/api";

interface NotesPanelProps {
    selectedNotebookId: string | null;
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNoteId: string | null
    refetchNotesKey: number
    notebooks: Notebook[] | null
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
}

export function NotesPanel ({
    selectedNotebookId,
    setSelectedNoteId,
    selectedNoteId,
    refetchNotesKey,
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
    }, [selectedNotebookId, refetchNotesKey, notebooks])

    const renderNotePreview = (content: string) => {
        let preview = ''
        const limit = 100;
        const chars = content.split('')
        if(content.length <= limit) return content
        for(let i = 0; i < limit; i++){
            preview += chars[i]
        }
        preview += '...'
        return preview
    }

    if(!selectedNotebookId){
        return  (
        <p>No notebook currently selected</p>
        )
    }

    return(
        <div className=" pt-4 w-[12vw]">
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
                    <p className="text-[2rem] text-bold">{selectedNotebookTitle}</p>
                    )}
            </div>
            <ul>
                { notes.length > 0 ? (
                    notes.map(note => (
                        <li key={note.id}>
                            <button
                                className={note.id === selectedNoteId ? 
                                    "bg-black border-1 border-white rounded-md mt-4 p-2 overflow-hidden h-[200px] w-full text-left flex flex-col items-start justify-start" : 
                                    "bg-black rounded-md min-w-[100px] mt-4 p-2 overflow-hidden h-[200px] w-full text-left flex flex-col items-start justify-start"}
                                onClick={() => {
                                    setSelectedNoteId(note.id)
                                }}
                                >
                                    <p className="font-bold text-base">
                                        {note.title}
                                    </p>
                                    <p className="text-sm">
                                        {renderNotePreview(note.content)}
                                    </p>
                                
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