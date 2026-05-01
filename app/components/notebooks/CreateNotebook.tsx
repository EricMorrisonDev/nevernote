"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react"

interface CreateNotebookProps {
    setRefetchNotebooksKey: Dispatch<SetStateAction<number>>
}

export function CreateNotebook ({
    setRefetchNotebooksKey
}: CreateNotebookProps) {

    const [newNotebookTitle, setNewNotebookTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleCreateNotebook = async (title: string) => {
        try{
            setLoading(true)
            setError(false)
            setMessage(null)

            const result = await fetch('/api/notebooks', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title })
            })

            if(!result.ok){
                setError(true)
                setMessage('Failed to create notebook')
                return
            }

            await result.json()
            setMessage('Notebook created')
            
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setNewNotebookTitle('')
            setRefetchNotebooksKey(prev => prev + 1)
        }
    }

    useEffect(() => {
        if(!message) return
        const timer = window.setTimeout(() => setMessage(''), 5000)
        return () => window.clearTimeout(timer)
    }, [message])

    return (
        <form
        className="m-4 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4"
        onSubmit={(e) => {
            e.preventDefault()
            if (!newNotebookTitle.trim()) return
            handleCreateNotebook(newNotebookTitle.trim())
        }}>
            <h4>Create A Notebook</h4>
            {message ? (
                <p
                className={error ? "text-red-500" : "text-control"}
                >{message}</p>
            ) : (
                null
            )
            }
            <label htmlFor="create-notebook-title" className="flex flex-col gap-2 text-sm text-muted">
                Notebook title
                <input
                    id="create-notebook-title"
                    type="text"
                    value={newNotebookTitle}
                    onChange={(e) => setNewNotebookTitle(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                    placeholder="My notebook"
                    disabled={loading}
                />
            </label>
            <button
                type="submit"
                disabled={loading || newNotebookTitle.trim().length === 0}
                className="rounded-lg border border-control-border bg-control-surface px-4 py-2 text-sm font-medium text-control hover:bg-control-surface-hover disabled:opacity-50"
            >
                Create
            </button>
        </form>
    )
}