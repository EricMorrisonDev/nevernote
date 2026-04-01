import { useState } from "react"

interface CreateNoteProps {
    selectedNotebookId: string
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
            onSubmit={() => {
                handleCreateNote(title, content, selectedNotebookId)
            }}
        >
            <input 
                type="text"
                placeholder="title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />
            <input 
                type="text"
                placeholder="content"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value)
                }}
            />
            
            <button
                type="submit"
            >
                Create
            </button>
        </form>
    )
}