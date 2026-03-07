"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GetStacksForm () {
    const [stacks, setStacks] = useState<{id: string, title: string}[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleGetStacks = async () => {
        setIsLoading(true)

        try{
            const res = await fetch('/api/stacks', {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            })
    
            if(!res.ok){
                const data = await res.json().catch(() => null)
                setError(data?.error ?? "Unknown error occurred")
                return
            }

            const resData = await res.json()
            setStacks(resData.data ?? [])
            router.refresh()
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div>
            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}
            <button
            disabled={isLoading}
            onClick={() => {
                handleGetStacks()
            }}>
                Get stacks
            </button>
            
            {stacks.length > 0 && (
                <ul>
                    {stacks.map((stack) => (
                        <li key={stack.id}>{stack.title}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}