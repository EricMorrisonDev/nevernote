"use client"

import { useEffect, useState } from "react";
import { Notebook } from "@/lib/types/api";
import { CreateNotebook } from "./CreateNotebook";

interface NotebooksPanelProps {
    selectedNotebookId: string | null,
    onSelectNotebook: (id: string) => void
}

export function NotebooksPanel({
    selectedNotebookId,
    onSelectNotebook
}: NotebooksPanelProps) {

    const [notebooks, setNotebooks] = useState<Notebook[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchNotebooks = async () => {
          try{
            setError(false)
            const res = await fetch('/api/notebooks')
            if(!res.ok) throw new Error(`Request failed: ${res.status}`)
            const parsed = await res.json()
            const list = parsed.data
    
            if(Array.isArray(list)){
              setNotebooks(list)
            } else {
              throw new Error('Invalid data type received')
            }
          } catch (e) {
            console.error(e)
            setNotebooks([])
            setError(true)
          }
        }
    
        fetchNotebooks()
      }, [])

    return(
        <div className="w-[15%]">
            <div>
                <CreateNotebook />
            </div>
            <div>
                {error && (
                    <p className="text-red-400">Error occurred</p>
                )}
                <ul className="m-4">
                    {notebooks === null ? (
                        <p>Loading...</p>
                    ) : notebooks.length === 0 ? (
                        <p>No notebooks currently.</p>
                    ) : (
                        notebooks.map((notebook) => (
                            <li key={notebook.id}>
                                <button
                                onClick={() => onSelectNotebook(notebook.id)}>
                                    {notebook.title}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}