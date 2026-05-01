"use client"

import { useState } from "react"

export function CreateStackForm () {
    const [title, setTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
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
            } else {
                setSuccess(`New stack: "${title}" created`)
            }
        } finally {
            setTitle('')
            setIsLoading(false)
        }
    }

    return(
        <form
        onSubmit={(e) => {
            handleSubmit(e)
        }}
        className="w-[300px] rounded-2xl border border-border bg-surface p-4 shadow-sm">
            { error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}
            { success && (
                <p className="text-emerald-400">
                    {success}
                </p>
            )}
            <label
            htmlFor="input-title"
            className="flex flex-col">
                Stack title
                <input 
                id="input-title"
                type="text"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
                className="my-2 w-[80%] rounded-lg border border-border bg-background p-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                />
            </label>
            <button
            disabled={isLoading}
            type="submit"
            className="my-2 rounded-lg border border-control-border bg-control-surface px-3 py-2 text-sm font-medium text-control hover:bg-control-surface-hover disabled:opacity-50">
                Create
            </button>
        </form>
    )
}