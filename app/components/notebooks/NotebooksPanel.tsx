"use client"

import { Dispatch, useEffect, useState, SetStateAction } from "react";
import { Notebook } from "@/lib/types/api";
import { CreateNotebook } from "./CreateNotebook";

interface NotebooksPanelProps {
    selectedNotebookId: string | null,
    setSelectedNotebookId: Dispatch<SetStateAction<string | null>>
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    notebooks: Notebook[] | null
    setNotebooks: Dispatch<SetStateAction<Notebook[] | null>>
}



export function NotebooksPanel({
    selectedNotebookId,
    setSelectedNoteId,
    setSelectedNotebookId,
    notebooks,
    setNotebooks
}: NotebooksPanelProps) {
    
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
        <div>
            <div>
                <CreateNotebook />
            </div>
            <div>
                {error && (
                    <p className="text-red-400">Error occurred</p>
                )}
                <ul className="m-4 flex flex-col gap-4">
                    {notebooks === null ? (
                        <p>Loading...</p>
                    ) : notebooks.length === 0 ? (
                        <p>No notebooks currently.</p>
                    ) : (
                        notebooks.map((notebook) => (
                            <li key={notebook.id}>
                                <button
                                onClick={() => {
                                    setSelectedNotebookId(notebook.id)
                                }}
                                className="border-1 border-white rounded-md p-1"
                                >
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