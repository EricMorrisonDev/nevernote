"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { Note } from "@/lib/types/api"

interface EditNotePanelProps {
    selectedNoteId: string | null,
    selectedNotebookId: string | null
    setRefetchKey: Dispatch<SetStateAction<number>>
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
}



export function EditNotePanel ({
    selectedNoteId,
    selectedNotebookId,
    setRefetchKey,
    notes,
    setNotes
}: EditNotePanelProps) {

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[error, setError] = useState(false)
    const[message, setMessage] = useState('')
    const[loading, setLoading] = useState(false)
    const[note, setNote] = useState<Note | null>(null)

    

    const handleCreateNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string
    ) => {
        if(title.length === 0 || content.length === 0) return

        try{
            setLoading(true)
            setError(false)
            setMessage('')

            const res = await fetch('/api/notes', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content, notebookId: selectedNotebookId })
            })

            if(!res.ok){
                throw new Error('Error creating note')
            }

            const parsed = await res.json()

            setMessage(`Note ${parsed.data.title} created!`)
            
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
            setTitle('')
            setContent('')
            setRefetchKey(prev => prev + 1)
        }

    }

    useEffect(() => {
        if(!selectedNoteId) return 

        const note = notes.find(note => note.id === selectedNoteId)
        if(!note){
            setError(true)
            setMessage('Note not found')
            return
        }
        setTitle(note.title)
        setContent(note.content)
    }, [selectedNoteId])

    return(

        <div className="pt-4 pl-4">
            <form
                className="flex flex-col w-[50vw] gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    handleCreateNote(title, content, selectedNotebookId)
                }}
                >
                <label
                htmlFor="title-input"
                >
                    Title
                </label>
                <input
                className="border-1 border-white rounded-md p-1 m-2 w-[200px]"
                    id="title-input"
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
                <label
                htmlFor="content-input"
                >
                    Content
                </label>
                <textarea
                    id="content-input"
                    className="border-1 border-white rounded-md p-1 m-2 h-[40vh]"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value)
                    }}

                    >
                    Type your note here
                </textarea>
                <button
                    className="border-1 border-white rounded-md w-[100px] mt-4"
                    type="submit"
                    disabled={loading}
                    >
                    Submit
                </button>
            </form>
        </div>
    )
}