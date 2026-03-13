"use client"

import { useState } from "react"

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
        }}
        className="w-[300px] border-1 border-white rounded-md p-2">
            { error && (
                <p className="text-red-500">
                    {error}
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
                className="border-1 border-white p-1 my-2 rounded-md w-[80%]"
                />
            </label>
            <button
            disabled={isLoading}
            type="submit"
            className="border-1 border-green-500 p-1 my-2 rounded-md">
                Create
            </button>
        </form>
    )
}