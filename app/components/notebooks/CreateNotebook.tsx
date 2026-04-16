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
            }

            const payload = await result.json()
            
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
        className="flex flex-col gap-4 m-4 p-4 border-1 border-white rounded-md"
        onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(title)
        }}>
            <h4>Create A Notebook</h4>
            {message ? (
                <p
                className={error ? "text-red-500" : "text-green-500"}
                >{message}</p>
            ) : (
                null
            )
            }
            
        </form>
    )
}