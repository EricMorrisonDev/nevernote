"use client"

import { useState } from "react";

export function GetStacksForm () {
    const [stacks, setStacks] = useState<{id: string, title: string}[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div className="w-[300px] rounded-2xl border border-border bg-surface p-4 shadow-sm">
            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}
            <button
            disabled={isLoading}
            onClick={() => {
                handleGetStacks()
            }}
            className="rounded-lg border border-control-border bg-control-surface px-3 py-2 text-sm font-medium text-control hover:bg-control-surface-hover disabled:opacity-50">
                Get stacks
            </button>
            
            <div className="my-2">
                <h4 className="mb-2">Your Stacks:</h4>
                {stacks.length > 0 ? (
                    <ul className="ml-2">
                        {stacks.map((stack) => (
                            <li key={stack.id}>{stack.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic ml-2">Stacks currently empty</p>
                )}
            </div>
        </div>
    )
}