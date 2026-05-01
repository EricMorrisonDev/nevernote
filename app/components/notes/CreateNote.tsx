"use client"

import { useEffect, useState } from "react"

interface CreateNoteProps {
    selectedNotebookId: string 
    onCreateNote: () => void
}

export function CreateNote ({
    selectedNotebookId,
    onCreateNote
    }: CreateNoteProps) {

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [error, setError] = useState(false)
    const [message, setMessage] = useState('')

    const handleCreateNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string
    ) => {
        if(title.length === 0 || content.length === 0) return

        try{
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
            setTitle('')
            setContent('')
            onCreateNote()
        }

    }

    useEffect(() => {
        if (!message) return
        const timer = window.setTimeout(() => setMessage(''), 5000)
        return () => window.clearTimeout(timer)
    }, [message])

    return (
        <form
            className="m-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
            onSubmit={(e) => {
                e.preventDefault()
                handleCreateNote(title, content, selectedNotebookId)
            }}
        >
            <h4>Create a new Note</h4>
            {message ? (
                <p
                className={error ? "text-red-500" : "text-control"}
                >{message}</p>
            ) : (
                null
            )}
            <input 
                className="rounded-lg border border-border bg-background p-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                type="text"
                placeholder="title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />
            <input 
                className="rounded-lg border border-border bg-background p-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                type="text"
                placeholder="content"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value)
                }}
            />
            
            <button
                type="submit"
                className="rounded-lg border border-control-border bg-control-surface px-4 py-2 text-sm font-medium text-control hover:bg-control-surface-hover"
            >
                Create Note
            </button>
        </form>
    )
}