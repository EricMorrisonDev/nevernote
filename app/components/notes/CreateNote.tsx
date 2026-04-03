"use client"

import { useState } from "react"

interface CreateNoteProps {
    selectedNotebookId: string | null
}

export function CreateNote ({
    selectedNotebookId
    }: CreateNoteProps) {

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [message, setMessage] = useState('')

    const handleCreateNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string
    ) => {

        try{
            setLoading(true)
            setError(false)
            setMessage('')

            const res = await fetch('/api/notes', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content, selectedNotebookId })
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
        }

    }

    return (
        <form
            className="border-1 border-white m-4 p-2 rounded-md flex flex-col gap-2"
            onSubmit={() => {
                if(!selectedNotebookId){
                    return
                }
                handleCreateNote(title, content, selectedNotebookId)
            }}
        >
            <h4>Create a new Note</h4>
            {message ? (
                <p
                className={error ? "text-red-500" : "text-green-500"}
                >{message}</p>
            ) : (
                null
            )}
            <input 
                className="border-1 border-white rounded-md p-1"
                type="text"
                placeholder="title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />
            <input 
                className="border-1 border-white rounded-md p-1"
                type="text"
                placeholder="content"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value)
                }}
            />
            
            <button
                type="submit"
                className="border-1 border-white rounded-md p-1"
            >
                Create Note
            </button>
        </form>
    )
}