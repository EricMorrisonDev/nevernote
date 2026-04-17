"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { Note } from "@/lib/types/api"

interface EditNotePanelProps {
    selectedNoteId: string | null,
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNotebookId: string | null,
    setRefetchNotesKey: Dispatch<SetStateAction<number>>
    notes: Note[] | []
    setNotes: Dispatch<SetStateAction<Note[] | []>>
    modalTitle: string,
    setModalTitle: Dispatch<SetStateAction<string>>
}



export function EditNotePanel ({
    selectedNoteId,
    selectedNotebookId,
    setRefetchNotesKey,
    notes,
    setNotes,
    setSelectedNoteId,
    modalTitle,
    setModalTitle
}: EditNotePanelProps) {

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[error, setError] = useState(false)
    const[message, setMessage] = useState('')
    const[loading, setLoading] = useState(false)
    const[note, setNote] = useState<Note | null>(null)

    
    const handleEditNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string | null,
        selectedNoteId: string | null
    ) => {

        try{
            setLoading(true)
            setError(false)
            setMessage('')

                const res = await fetch(`api/notes/${selectedNoteId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ title, content, notebookId: selectedNotebookId })
                })

            if(!res.ok){
                throw new Error('Error updating note')
            }

            const parsed = await res.json()

           
            
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
            setRefetchNotesKey(prev => prev + 1)
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
            setRefetchNotesKey(prev => prev + 1)
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
    }, [selectedNoteId, notes])

    useEffect(() => {
        if(!message) return
        const timer = window.setTimeout(() => setMessage(''), 5000)
        return () => window.clearTimeout(timer)
    }, [message])

    return(

        <div className="p-8 rounded-lg bg-black">
            <form
                className="flex flex-col w-[50vw] gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    handleEditNote(title, content, selectedNotebookId, selectedNoteId)
                }}
                onBlur={() => {
                    if(!selectedNoteId || loading) return
                    // update this later to only save if an actual change was made.
                    // right now it will always save whenever a user clicks away.
                    handleEditNote(title, content, selectedNotebookId, selectedNoteId )
                }}
                >
                <input
                className="text-[3rem] rounded-md p-1 m-2 outline-none"
                    id="title-input"
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                    placeholder="title"
                />
                <textarea
                    id="content-input"
                    className="border-1 border-gray-300 rounded-md p-4 m-2 h-[40vh]"
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
                        className="border-1 border-blue-500 text-blue-500 rounded-md w-[100px] mt-4"
                        onClick={() => {
                            if(!selectedNoteId) return
                            handleDeleteNote(selectedNoteId)
                        }}
                    >
                        Delete Note
                    </button>)}
                </div>
                {/* <div>
                    {message.length > 0 && (
                        <p
                        className="text green-500"
                        >
                            {message}
                        </p>
                    )}
                </div> */}
            </form>
        </div>
    )
}