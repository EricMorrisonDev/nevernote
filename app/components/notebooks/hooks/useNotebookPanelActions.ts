import { Dispatch, SetStateAction } from "react"
import { initializeNote } from "@/app/lib/InitializeNote"

type NotebookPanelMenuState =
    | { kind: "stack"; id: string; x: number; y: number }
    | { kind: "notebook"; id: string; x: number; y: number }
    | null

interface UseNotebookPanelActionsParams {
    newStackTitle: string
    notebooksToAddToStack: string[]
    setLoading: Dispatch<SetStateAction<boolean>>
    setError: Dispatch<SetStateAction<boolean>>
    setRefetchNotebooksKey: Dispatch<SetStateAction<number>>
    setNewStackTitle: Dispatch<SetStateAction<string>>
    setNewNotebookTitle: Dispatch<SetStateAction<string>>
    setNotebooksToAddToStack: Dispatch<SetStateAction<string[]>>
    setMenuState: Dispatch<SetStateAction<NotebookPanelMenuState>>
    setStackIdToBeDeleted: Dispatch<SetStateAction<string | null>>
    setSelectedNotebookId: Dispatch<SetStateAction<string | null>>
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    closeModal: () => void
}

export function useNotebookPanelActions({
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
}: UseNotebookPanelActionsParams) {
    const handleCreateStack = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/stacks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: newStackTitle,
                    notebooks: notebooksToAddToStack,
                }),
            })

            if (!res.ok) {
                throw new Error("Error creating stack")
            }

            setRefetchNotebooksKey((prev) => prev + 1)
            setNewStackTitle("")
            setNotebooksToAddToStack([])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
            closeModal()
        }
    }

    const handleEditStackTitle = async (id: string, newTitle: string) => {
        if (!id || !newTitle.trim()) return
        try {
            const res = await fetch(`/api/stacks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: newTitle }),
            })

            if (!res.ok) {
                throw new Error("Error updating stack name")
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleEditNotebookTitle = async (id: string, newTitle: string) => {
        if (!id || !newTitle.trim()) return
        try {
            const res = await fetch(`/api/notebooks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: newTitle }),
            })

            if (!res.ok) {
                throw new Error("Error updating notebook name")
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleRemoveNotebookFromStack = async (id: string) => {
        if (!id) return
        try {
            const res = await fetch(`/api/notebooks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stackId: null }),
            })

            if (!res.ok) {
                throw new Error("Error removing notebook from stack")
            }

            setRefetchNotebooksKey((prev) => prev + 1)
            setMenuState(null)
        } catch (e) {
            console.error(e)
        }
    }

    const handleDeleteStack = async (stackIdToBeDeleted: string | null) => {
        if (!stackIdToBeDeleted) return
        try {
            setLoading(true)
            const res = await fetch(`/api/stacks/${stackIdToBeDeleted}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Error deleting stack")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
            setRefetchNotebooksKey((prev) => prev + 1)
            setStackIdToBeDeleted(null)
            closeModal()
        }
    }

    const handleCreateNotebook = async (title: string) => {
        try {
            setLoading(true)
            setError(false)

            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title }),
            })

            if (!res.ok) {
                setError(true)
            }

            const parsed = await res.json()
            const newNotebookId = parsed.data.id

            const result = await initializeNote(newNotebookId)
            const newNoteId = result?.id
            if (newNoteId) setSelectedNoteId(newNoteId)
            setSelectedNotebookId(newNotebookId)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setNewNotebookTitle("")
            setRefetchNotebooksKey((prev) => prev + 1)
            closeModal()
        }
    }

    return {
        handleCreateStack,
        handleEditStackTitle,
        handleEditNotebookTitle,
        handleRemoveNotebookFromStack,
        handleDeleteStack,
        handleCreateNotebook,
    }
}
