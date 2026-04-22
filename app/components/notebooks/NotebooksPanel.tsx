"use client"

import { Dispatch, useEffect, useRef, useState, SetStateAction } from "react";
import type { Notebook, Stack } from "@/lib/types/api";
import { Modal } from "../Modal";
import Image from "next/image";
import { NotebooksMenu } from "./panelComponents/NotebooksMenu";
import { StacksMenu } from "./panelComponents/StacksMenu";
import { DeleteNotebookModal } from "./panelComponents/DeleteNotebookModal";
import { CreateStackModal } from "./panelComponents/CreateStackModal";
import { CreateNotebookModal } from "./panelComponents/CreateNotebookModal";
import { DeleteStackModal } from "./panelComponents/DeleteStackModal";
import { useNotebookPanelActions } from "./hooks/useNotebookPanelActions";

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

type MenuType = 
    | { kind: "stack"; id: string; x: number, y: number }
    | { kind: "notebook"; id: string; x: number, y: number }
    | null

type EditState =
    | { kind: "stack"; id: string; value: string }
    | { kind: "notebook"; id: string; value: string }
    | null

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
    const [stackIdToBeDeleted, setStackIdToBeDeleted] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [modalType, setModalType] = useState<ModalType>(null)
    const [newNotebookTitle, setNewNotebookTitle] = useState('')
    const [newStackTitle, setNewStackTitle] = useState('')
    const [stacks, setStacks] = useState<Stack[]>([])
    const [openStackId, setOpenStackId] = useState('')
    const [notebooksToAddToStack, setNotebooksToAddToStack] = useState<string[]>([])
    const [menuState, setMenuState] = useState<MenuType | null>(null)
    const [editState, setEditState] = useState<EditState>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const editInputRef = useRef<HTMLInputElement | null>(null)

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

    const {
        handleCreateStack,
        handleEditStackTitle,
        handleEditNotebookTitle,
        handleRemoveNotebookFromStack,
        handleDeleteStack,
        handleCreateNotebook,
        handleMoveNotebook
    } = useNotebookPanelActions({
        newStackTitle,
        notebooksToAddToStack,
        setLoading,
        setError,
        setRefetchNotebooksKey,
        setNewStackTitle,
        setNewNotebookTitle,
        setNotebooksToAddToStack,
        setMenuState,
        setStackIdToBeDeleted,
        setSelectedNotebookId,
        setSelectedNoteId,
        closeModal,
    })

    const submitStackTitleEdit = async () => {
        if (!editState || editState.kind !== "stack") return
        await handleEditStackTitle(editState.id, editState.value)
        setEditState(null)
        setRefetchNotebooksKey((prev) => prev + 1)
    }

    const submitNotebookTitleEdit = async () => {
        if (!editState || editState.kind !== "notebook") return
        await handleEditNotebookTitle(editState.id, editState.value)
        setEditState(null)
        setRefetchNotebooksKey((prev) => prev + 1)
    }

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
            setSelectedNoteId(null)
            setModalOpen(false)
        }
    }

    const renderMenu = () => {
        if(!menuState) return null

        return(
            <div
            ref={menuRef}
            className="fixed z-50 w-[200px]"
            style={{ left: menuState.x, top: menuState.y }}
            >
                {menuState.kind === "notebook" ? (
                    <NotebooksMenu
                        notebooks={notebooks}
                        setEditState={setEditState}
                        menuState={menuState}
                        onRemoveFromStack={handleRemoveNotebookFromStack}
                        onCloseMenu={() => {
                            setMenuState(null)
                        }}
                        onDeleteNotebook={(id) => {
                            setNotebookIdToBeDeleted(id)
                            setMenuState(null)
                            openModal("delete")
                        }}
                    />
                ) : (
                    <StacksMenu
                        stacks={stacks}
                        setEditState={setEditState}
                        menuState={menuState}
                        onCloseMenu={() => {
                            setMenuState(null)
                        }}
                        onDeleteStack={(id) => {
                            setStackIdToBeDeleted(id)
                            setMenuState(null)
                            openModal("delete")
                        }}
                    />
                )}
            </div>
        )
    }

    useEffect(() => {
        if (!menuState) return

        const handleClickOutside = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (menuRef.current && target && !menuRef.current.contains(target)) {
                setMenuState(null)
            }
        }

        document.addEventListener("pointerdown", handleClickOutside)
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
        }
    }, [menuState])

    const activeEditTarget = editState ? `${editState.kind}:${editState.id}` : null

    useEffect(() => {
        if (!activeEditTarget) return
        editInputRef.current?.focus()
        editInputRef.current?.select()
    }, [activeEditTarget])

    const renderModalContent = () => {
        switch (modalType) {
            case "delete":
                if (stackIdToBeDeleted) {
                    return (
                        <DeleteStackModal
                            stackTitle={stackPendingDeletion?.title}
                            onConfirmDelete={() => {
                                handleDeleteStack(stackIdToBeDeleted)
                            }}
                            onCancel={() => {
                                setStackIdToBeDeleted(null)
                                closeModal()
                            }}
                        />
                    )
                }
                return (
                    <DeleteNotebookModal
                        notebookTitle={notebookPendingDeletion?.title}
                        onConfirmDelete={() => {
                            handleDeleteNotebook(notebookIdToBeDeleted)
                        }}
                        onCancel={() => {
                            setNotebookIdToBeDeleted(null)
                            closeModal()
                        }}
                    />
                )
            case "create-notebook":
                return (
                    <CreateNotebookModal
                        newNotebookTitle={newNotebookTitle}
                        setNewNotebookTitle={setNewNotebookTitle}
                        loading={loading}
                        onSubmit={handleCreateNotebook}
                        onCancel={closeModal}
                    />
                )
                // come back and finish this
            case "create-stack":
                return (
                    <CreateStackModal
                        newStackTitle={newStackTitle}
                        setNewStackTitle={setNewStackTitle}
                        notebooks={notebooks}
                        notebooksToAddToStack={notebooksToAddToStack}
                        setNotebooksToAddToStack={setNotebooksToAddToStack}
                        loading={loading}
                        onSubmit={handleCreateStack}
                        onCancel={closeModal}
                    />
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
      const stackPendingDeletion = stackIdToBeDeleted && stacks ?
        stacks.find(stack => stack.id === stackIdToBeDeleted) :
        undefined

    

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
            </div>

            {/* render stacks */}

            <div>
                {stacks.length > 0 && (
                    <ul className="m-4 flex flex-col gap-4"
                        aria-labelledby="stacks-list"
                        >
                        {stacks.map(stack => (
                            <li key={stack.id}>
                                <div className="flex group">
                                    <button 
                                        className="flex w-full items-center gap-2 text-left"
                                        onClick={() => {
                                            setOpenStackId(prev => prev === stack.id ? '' : stack.id)
                                        }}>
                                        <Image src={'/noun-books-3239771-f5f0f0.svg'} 
                                            alt="Notebook icon"
                                            width={20}
                                            height={20}
                                            className="shrink-0"
                                            />
                                        {editState?.kind === "stack" && editState.id === stack.id ? (
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editState.value}
                                                onChange={(e) => {
                                                    setEditState((prev) =>
                                                        prev?.kind === "stack" && prev.id === stack.id
                                                            ? { ...prev, value: e.target.value }
                                                            : prev
                                                    )
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        void submitStackTitleEdit()
                                                    } else if (e.key === "Escape") {
                                                        setEditState(null)
                                                    }
                                                }}
                                                onBlur={() => {
                                                    void submitStackTitleEdit()
                                                }}
                                                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none"
                                            />
                                        ) : (
                                            <span className="min-w-0 flex-1 truncate">{stack.title}</span>
                                        )}
                                    </button>
                                    <button>
                                        <Image src={'/noun-ellipsis-vertical-7182731-f5f0f0.svg'}
                                        alt="menu icon"
                                        width={15}
                                        height={15}
                                        className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuState({ kind: "stack", id: stack.id,
                                                x: e.clientX, y: e.clientY
                                            })
                                        }}
                                        />
                                    </button>                                  
                                </div>
                                {stack.id === openStackId && (
                                    <ul className="mt-2 ml-2 flex flex-col gap-2">
                                        {notebooks?.filter(
                                            (n) => n.stackId === stack.id
                                        ).map((notebook) => (
                                            <li key={notebook.id}
                                            className={notebook.id === selectedNotebookId ? "rounded-xl border border-accent/50 bg-surface p-1" : "p-1"}>
                                                <div className="flex group">
                                                    <button
                                                    onClick={() => {
                                                        setSelectedNotebookId(notebook.id)
                                                    }}
                                                    className="flex w-full items-center gap-2 text-left rounded-md p-1 text-foreground hover:text-accent"
                                                    >
                                                    <Image src={'/noun-notebook-8289864-f5f0f0.svg'} 
                                                        alt="Notebook icon"
                                                        width={20}
                                                        height={20}
                                                        className="shrink-0"
                                                        />
                                                        {editState?.kind === "notebook" && editState.id === notebook.id ? (
                                                            <input
                                                                ref={editInputRef}
                                                                type="text"
                                                                value={editState.value}
                                                                onChange={(e) => {
                                                                    setEditState((prev) =>
                                                                        prev?.kind === "notebook" && prev.id === notebook.id
                                                                            ? { ...prev, value: e.target.value }
                                                                            : prev
                                                                    )
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault()
                                                                        void submitNotebookTitleEdit()
                                                                    } else if (e.key === "Escape") {
                                                                        setEditState(null)
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    void submitNotebookTitleEdit()
                                                                }}
                                                                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none"
                                                            />
                                                        ) : (
                                                            <span className="min-w-0 flex-1 truncate">{notebook.title}</span>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                                        aria-label="Open notebook menu"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setMenuState({ kind: "notebook", id: notebook.id,
                                                                x: e.clientX, y: e.clientY
                                                            })
                                                        }}
                                                    >
                                                        <Image src={'/noun-ellipsis-vertical-7182731-f5f0f0.svg'}
                                                            alt="menu icon"
                                                            width={15}
                                                            height={15}
                                                            className="shrink-0"
                                                        />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* render notebooks */}

            <div>
                {error && (
                    <p className="text-red-400">Error occurred</p>
                )}
                <ul className="ml-4 flex flex-col gap-4"
                    aria-labelledby="notebooks-list"
                >
                    {notebooks === null ? (
                        <p>Loading...</p>
                    ) : notebooks.length === 0 ? (
                        <p>No notebooks currently.</p>
                    ) : (
                        notebooks.filter(
                            (n) => !n.stackId
                        ).map((notebook) => (
                            <li key={notebook.id}
                            className={notebook.id === selectedNotebookId ? "rounded-xl border border-accent/50 bg-surface p-1" : "p-1"}>
                                <div className="flex group">
                                    <button
                                    onClick={() => {
                                        setSelectedNotebookId(notebook.id)
                                    }}
                                    className="flex w-full items-center gap-2 text-left rounded-md p-1 text-foreground hover:text-accent"
                                    >
                                    <Image src={'/noun-notebook-8289864-f5f0f0.svg'} 
                                        alt="Notebook icon"
                                        width={20}
                                        height={20}
                                        className="shrink-0"
                                        />
                                        {editState?.kind === "notebook" && editState.id === notebook.id ? (
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editState.value}
                                                onChange={(e) => {
                                                    setEditState((prev) =>
                                                        prev?.kind === "notebook" && prev.id === notebook.id
                                                            ? { ...prev, value: e.target.value }
                                                            : prev
                                                    )
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        void submitNotebookTitleEdit()
                                                    } else if (e.key === "Escape") {
                                                        setEditState(null)
                                                    }
                                                }}
                                                onBlur={() => {
                                                    void submitNotebookTitleEdit()
                                                }}
                                                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none"
                                            />
                                        ) : (
                                            <span className="min-w-0 flex-1 truncate">{notebook.title}</span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                        aria-label="Open notebook menu"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuState({ kind: "notebook", id: notebook.id,
                                                x: e.clientX, y: e.clientY
                                            })
                                        }}
                                    >
                                        <Image src={'/noun-ellipsis-vertical-7182731-f5f0f0.svg'}
                                            alt="menu icon"
                                            width={15}
                                            height={15}
                                            className="shrink-0"
                                        />
                                        
                                    </button>
                                </div>
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
                {renderMenu()}
        </div>
    )
}