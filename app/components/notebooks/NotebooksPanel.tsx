"use client"

import { Dispatch, useEffect, useState, SetStateAction } from "react";
import type { Notebook, Stack } from "@/lib/types/api";
import { Modal } from "../Modal";
import { initializeNote } from "@/app/lib/InitializeNote";
import Image from "next/image"

interface NotebooksPanelProps {
    selectedNotebookId: string | null,
    setSelectedNotebookId: Dispatch<SetStateAction<string | null>>
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    notebooks: Notebook[] | null
    setNotebooks: Dispatch<SetStateAction<Notebook[] | null>>
    refetchNotebooksKey: number,
    setRefetchNotebooksKey: Dispatch<SetStateAction<number>>
    modalOpen: boolean,
    setModalOpen: Dispatch<SetStateAction<boolean>>
    modalTitle: string,
    setModalTitle: Dispatch<SetStateAction<string>>
}

type ModalType = "delete" | "create-notebook" | "create-stack" | null;

export function NotebooksPanel({
    selectedNotebookId,
    setSelectedNotebookId,
    refetchNotebooksKey,
    setRefetchNotebooksKey,
    setSelectedNoteId,
    notebooks,
    setNotebooks,
    modalOpen,
    setModalOpen,
    modalTitle,
    setModalTitle
}: NotebooksPanelProps) {
    
    const [error, setError] = useState(false)
    const [notebookIdToBeDeleted, setNotebookIdToBeDeleted] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [modalType, setModalType] = useState<ModalType>(null)
    const [newNotebookTitle, setNewNotebookTitle] = useState('')
    const [newStackTitle, setNewStackTitle] = useState('')
    const [stacks, setStacks] = useState<Stack[]>([])
    const [notebooksToAddToStack, setNotebooksToAddToStack] = useState<string[]>([])

    const openModal = (type: Exclude<ModalType, null>) => {
        setModalOpen(true)
        setModalType(type)
        setModalTitle(type)
    }

    const closeModal = () => {
        setModalOpen(false)
        setModalType(null)
        setModalTitle('')
    }

    const renderModalContent = () => {
        switch (modalType) {
            case "delete":
                return (
                    <>
                        <h4 id="delete-notebook-title">Are you sure you want to delete {notebookPendingDeletion?.title} ?</h4>
                        <p>This will also delete all notes contained in the notebook.</p>
                        <div className="flex justify-between mt-4">
                            <button
                            className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/15 w-[110px]"
                            onClick={() => {
                                handleDeleteNotebook(notebookIdToBeDeleted)
                            }}>
                                Delete
                            </button>
                            <button
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                            onClick={() => {
                                setNotebookIdToBeDeleted(null)
                                closeModal()
                            }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )
            case "create-notebook":
                return (
                    <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleCreateNotebook(newNotebookTitle)
                    }}
                        >
                        <h4>Name your new notebook</h4>
                        <input 
                            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-ring/40"
                            type="text"
                            placeholder="title"
                            value={newNotebookTitle}
                            onChange={(e) => {
                                setNewNotebookTitle(e.target.value)
                            }}
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15 w-[110px]"
                                disabled={loading}
                                >
                                Create
                            </button>
                            <button
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                                onClick={() => {
                                    closeModal()
                                }}
                                >
                                    Cancel
                            </button>
                        </div>
                    </form>
                )
                // come back and finish this
            case "create-stack":
                return (
                    <form
                        >
                        <h4>Name your new stack</h4>
                        <input 
                            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-ring/40"
                            type="text"
                            placeholder="title"
                            value={newStackTitle}
                            onChange={(e) => {
                                setNewStackTitle(e.target.value)
                            }}
                        />
                        <div>
                            <ul>
                                {notebooks?.filter(
                                    notebook => !notebook.stackId
                                ).map(notebook => (
                                    <li key={notebook.id}>
                                        <button
                                        type="button"
                                        onClick={() => {
                                            setNotebooksToAddToStack((prev: string[]) => {
                                                const alreadySelected = prev.some((id) =>id === notebook.id)
                                                if(alreadySelected){
                                                    return prev.filter((id) => id !== notebook.id)
                                                }
                                                return [...prev, notebook.id]
                                            })
                                        }}
                                        >
                                            {notebook.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15 w-[110px]"
                                disabled={loading}
                                >
                                Create
                            </button>
                            <button
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                                onClick={() => {
                                    closeModal()
                                }}
                                >
                                    Cancel
                            </button>
                        </div>
                    </form>
                )
        }
    }

    const fetchNotebooks = async () => {
      try{
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
      }
    }

    const fetchStacks = async() => {
        
        try{
            const res = await fetch('/api/stacks')

            if(!res.ok){
                throw new Error('Error fetching stacks')
            }

            const stacks = await res.json()
            if(Array.isArray(stacks.data)){
                setStacks(stacks.data)
            }
        } catch (e) {
            console.error(e)
            setStacks([])
        }
    }

    useEffect(() => {
        const run = async() => {
            try {
                setLoading(true)
                await Promise.all([fetchNotebooks(), fetchStacks()])
            } finally {
                setLoading(false)
            }
        }

        void run()
      }, [refetchNotebooksKey])

      const notebookPendingDeletion = notebookIdToBeDeleted && notebooks ?
        notebooks.find(nb => nb.id === notebookIdToBeDeleted) :
        undefined

    const handleDeleteNotebook = async (notebookIdToBeDeleted: string | null) => {

        if(!notebookIdToBeDeleted) return

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
            setSelectedNotebookId(null)
            setModalOpen(false)
        }
    }

    const handleCreateNotebook = async (title: string) => {
        try{
            setLoading(true)
            setError(false)

            const res = await fetch('/api/notebooks', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title })
            })

            if(!res.ok){
                setError(true)
            }

            const parsed = await res.json()
            const newNotebookId = parsed.data.id

            const result = await initializeNote(newNotebookId)
            const newNoteId = result?.id
            if(newNoteId) setSelectedNoteId(newNoteId)
            setSelectedNotebookId(newNotebookId)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setNewNotebookTitle('')
            setRefetchNotebooksKey(prev => prev + 1)
            closeModal()
            
        }
    }

    return(
        <div>
            <div className="flex flex-col gap-2 px-4">
                <button
                    className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15"
                    onClick={(e) => {
                        e.preventDefault()
                        openModal("create-stack")
                    }}
                >
                    + Stack
                </button>
                <button
                    className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15"
                    onClick={(e) => {
                        e.preventDefault()
                        openModal("create-notebook")
                    }}
                >
                    + Notebook
                </button>
                {selectedNotebookId && (
                    <button
                        className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/15"
                        onClick={() => {
                            setNotebookIdToBeDeleted(selectedNotebookId)
                            openModal("delete")
                        }}
                    >
                        Delete Notebook
                    </button>)}
            </div>
            <div>
                {stacks.length > 0 && (
                    <ul className="m-4 flex flex-col gap-4"
                        aria-labelledby="stacks-list"
                        >
                        {stacks.map(stack => (
                            <li key={stack.id}>
                                <button>
                                    <Image src={'/noun-books-3239771-f5f0f0.svg'} 
                                        alt="Notebook icon"
                                        width={20}
                                        height={20}
                                    />
                                    {stack.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                {error && (
                    <p className="text-red-400">Error occurred</p>
                )}
                <ul className="m-4 flex flex-col gap-4"
                    aria-labelledby="notebooks-list"
                >
                    {notebooks === null ? (
                        <p>Loading...</p>
                    ) : notebooks.length === 0 ? (
                        <p>No notebooks currently.</p>
                    ) : (
                        notebooks.map((notebook) => (
                            <li key={notebook.id}
                            className={notebook.id === selectedNotebookId ? "rounded-xl border border-accent/50 bg-surface p-1" : ""}>
                                <button
                                onClick={() => {
                                    setSelectedNotebookId(notebook.id)
                                }}
                                className={"rounded-md p-1 w-[100px] text-left flex gap-2 text-foreground hover:text-accent"}
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
                <Modal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    title={modalTitle}
                >
                    {renderModalContent()}
                </Modal>
        </div>
    )
}