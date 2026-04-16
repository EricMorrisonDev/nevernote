"use client"

import { Dispatch, useEffect, useState, SetStateAction } from "react";
import { Notebook } from "@/lib/types/api";
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

type ModalContext = {
    notebookId?: string,
    notebookName?: string,
}


export function NotebooksPanel({
    selectedNotebookId,
    setSelectedNoteId,
    setSelectedNotebookId,
    refetchNotebooksKey,
    setRefetchNotebooksKey,
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
    const [modalContext, setModalContext] = useState<ModalContext>()
    const [newNotebookTitle, setNewNotebookTitle] = useState('')
    const [newStackTitle, setNewStackTitle] = useState('')

    const openModal = (type: Exclude<ModalType, null>, context: ModalContext = {}) => {
        setModalOpen(true)
        setModalType(type)
        setModalContext(context)
        setModalTitle(type)
    }

    const closeModal = () => {
        setModalOpen(false)
        setModalType(null)
        setModalContext({})
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
                            className="border-1 border-white rounded-md pl-2"
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
                                className="border-1 border-white p-1 w-[100px] rounded-md"
                                disabled={loading}
                                >
                                Create
                            </button>
                            <button
                                className="border-1 border-white p-1 w-[100px] rounded-md"
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
                            className="border-1 border-white rounded-md pl-2"
                            type="text"
                            placeholder="title"
                            value={newStackTitle}
                            onChange={(e) => {
                                setNewStackTitle(e.target.value)
                            }}
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="border-1 border-white p-1 w-[100px] rounded-md"
                                disabled={loading}
                                >
                                Create
                            </button>
                            <button
                                className="border-1 border-white p-1 w-[100px] rounded-md"
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

            initializeNote("", "", newNotebookId)
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
                    className="border-1 border-green-500 text-green-500 p-1 rounded-md"
                    onClick={(e) => {
                        e.preventDefault()
                        openModal("create-stack")
                    }}
                >
                    + Stack
                </button>
                <button
                    className="border-1 border-green-500 text-green-500 p-1 rounded-md"
                    onClick={(e) => {
                        e.preventDefault()
                        openModal("create-notebook")
                    }}
                >
                    + Notebook
                </button>
                {selectedNotebookId && (
                    <button
                        className="border-1 border-blue-500 text-blue-500 rounded-md p-1"
                        onClick={() => {
                            setNotebookIdToBeDeleted(selectedNotebookId)
                            openModal("delete")
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