"use client"

import { Dispatch, useEffect, useState, SetStateAction } from "react";
import { Notebook } from "@/lib/types/api";
import { CreateNotebook } from "./CreateNotebook";
import Image from "next/image"

interface NotebooksPanelProps {
    selectedNotebookId: string | null,
    setSelectedNotebookId: Dispatch<SetStateAction<string | null>>
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    notebooks: Notebook[] | null
    setNotebooks: Dispatch<SetStateAction<Notebook[] | null>>
    refetchNotebooksKey: number,
    setRefetchNotebooksKey: Dispatch<SetStateAction<number>>
}



export function NotebooksPanel({
    selectedNotebookId,
    setSelectedNoteId,
    setSelectedNotebookId,
    refetchNotebooksKey,
    setRefetchNotebooksKey,
    notebooks,
    setNotebooks
}: NotebooksPanelProps) {
    
    const [error, setError] = useState(false)
    const [notebookIdToBeDeleted, setNotebookIdToBeDeleted] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchNotebooks = async () => {
          try{
            setLoading(true)
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
          } finally {
            setLoading(false)
          }
        }
    
        fetchNotebooks()
      }, [refetchNotebooksKey])

      const notebookPendingDeletion = notebookIdToBeDeleted && notebooks ?
        notebooks.find(nb => nb.id === notebookIdToBeDeleted) :
        undefined

      const handleDeleteNotebook = async (notebookIdToBeDeleted: string) => {

        try{
            setLoading(true)
            const res = await fetch(`/api/notebooks/${notebookIdToBeDeleted}`, {
                method: "DELETE"
            })

            if(!res.ok){
                throw new Error('Error deleting notebook')
            }

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setRefetchNotebooksKey(prev => prev + 1)
            setNotebookIdToBeDeleted(null)
        }
      }

    return(
        <div>
            <div>
                <CreateNotebook 
                    setRefetchNotebooksKey={setRefetchNotebooksKey}
                />
            </div>
            <div>
                {selectedNotebookId && (
                    <button
                        className="ml-4 border-1 border-blue-500 text-blue-500 rounded-md p-1"
                        onClick={() => {
                            setNotebookIdToBeDeleted(selectedNotebookId)
                        }}
                    >
                        Delete Notebook
                    </button>)}
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
                            <li key={notebook.id}
                            className={notebook.id === selectedNotebookId ? "border-1 border-white rounded-md p-1" : ""}>
                                <button
                                onClick={() => {
                                    setSelectedNotebookId(notebook.id)
                                }}
                                className={"rounded-md p-1 w-[100px] text-left flex gap-2"}
                                >
                                <Image src={'/noun-notebook-8289864-f5f0f0.svg'} 
                                    alt="Notebook icon"
                                    width={20}
                                    height={20}
                                    />
                                    {notebook.title}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            {notebookIdToBeDeleted && notebookPendingDeletion && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    role="presentation"
                >
                    <div
                        className="w-full max-w-md rounded-lg border border-white bg-neutral-950 p-6 shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-notebook-title"
                        onClick={(e) => {
                            e.stopPropagation()
                            setNotebookIdToBeDeleted(null)
                        }}
                    >
                        <h4 id="delete-notebook-title">Are you sure you want to delete {notebookPendingDeletion.title} ?</h4>
                        <p>This will also delete all notes contained in the notebook.</p>
                        <div className="flex justify-between mt-4">
                            <button
                            className="border-1 border-white p-1 w-[100px] rounded-md"
                            onClick={() => {
                                handleDeleteNotebook(notebookIdToBeDeleted)
                            }}>
                                Delete
                            </button>
                            <button
                            className="border-1 border-white p-1 w-[100px] rounded-md"
                            onClick={() => {
                                setNotebookIdToBeDeleted(null)
                            }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}