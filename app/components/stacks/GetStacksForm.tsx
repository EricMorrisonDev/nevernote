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
        <div className="w-[300px] border-1 border-white rounded-md p-2">
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
            className="border-1 border-green-500 p-1 rounded-md">
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