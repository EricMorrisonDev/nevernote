"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { Note } from "@/lib/types/api"

interface EditNotePanelProps {
    selectedNoteId: string | null,
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNotebookId: string,
    setRefetchKey: Dispatch<SetStateAction<number>>
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
}



export function EditNotePanel ({
    selectedNoteId,
    selectedNotebookId,
    setRefetchKey,
    notes,
    setNotes,
    setSelectedNoteId
}: EditNotePanelProps) {

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[error, setError] = useState(false)
    const[message, setMessage] = useState('')
    const[loading, setLoading] = useState(false)
    const[note, setNote] = useState<Note | null>(null)

    
// remember to update the name of this func since it doesn't just create
    const handleCreateNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string,
        selectedNoteId: string | null
    ) => {
        if(title.length === 0 || content.length === 0) return

        try{
            setLoading(true)
            setError(false)
            setMessage('')

            const url = !selectedNoteId ? '/api/notes' : `api/notes/${selectedNoteId}`
            const method = !selectedNoteId ? "POST" : "PUT"

                const res = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ title, content, notebookId: selectedNotebookId })
                })

            if(!res.ok){
                throw new Error(!selectedNoteId? 'Error creating note' : 'Error updating note')
            }

            const parsed = await res.json()

            setMessage(!selectedNoteId ? `Note ${parsed.data.title} created!` : `Note ${parsed.data.title} updated!`)
            
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
            setTitle('')
            setContent('')
            setRefetchKey(prev => prev + 1)
            setSelectedNoteId(null)
        }

    }

    const handleDeleteNote = async (id: string) => {

        try{
            const noteTitle = title
            setLoading(true)
            setTitle('')
            setContent('')
            const res = await fetch(`/api/notes/${id}`, {
                method: "DELETE"
            })

            if(!res.ok){
                throw new Error('Error deleting note')
            }

            setMessage(`${noteTitle} deleted`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setSelectedNoteId(null)
        }
    }

    useEffect(() => {
        setTitle('')
        setContent('')
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
                    handleCreateNote(title, content, selectedNotebookId, selectedNoteId)
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
                <div className="flex justify-between">
                    <button
                        className="border-1 border-white rounded-md w-[100px] mt-4"
                        type="submit"
                        disabled={loading}
                        >
                        Submit
                    </button>
                    {selectedNoteId && (<button
                        className="border-1 border-red-500 text-red-500 rounded-md w-[100px] mt-4"
                        onClick={() => {
                            if(!selectedNoteId) return
                            handleDeleteNote(selectedNoteId)
                        }}
                    >
                        Delete
                    </button>)}
                </div>
                <div>
                    {message.length > 0 && (
                        <p
                        className="text green-500"
                        >
                            {message}
                        </p>
                    )}
                </div>
            </form>
        </div>
    )
}