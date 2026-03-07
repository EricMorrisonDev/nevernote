"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CreateStackForm () {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try{
            const res = await fetch('/api/stacks', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ title })
            })

            if(!res.ok){
                const data = await res.json().catch(() => null)
                setError(data?.error ?? "Unknown error occurred");
            }
            router.refresh()
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <form
        onSubmit={(e) => {
            handleSubmit(e)
        }}>
            { error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}
            <label
            htmlFor="input-title">
                Stack title
                <input 
                id="input-title"
                type="text"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
                />
            </label>
            <button
            disabled={isLoading}
            type="submit">
                Create
            </button>
        </form>
    )
}