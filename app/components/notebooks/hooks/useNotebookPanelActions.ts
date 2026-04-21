import { Dispatch, SetStateAction } from "react"

interface UseNotebookPanelActionsParams {
    newStackTitle: string
    notebooksToAddToStack: string[]
    setLoading: Dispatch<SetStateAction<boolean>>
    setRefetchNotebooksKey: Dispatch<SetStateAction<number>>
    setNewStackTitle: Dispatch<SetStateAction<string>>
    setNotebooksToAddToStack: Dispatch<SetStateAction<string[]>>
    closeModal: () => void
}

export function useNotebookPanelActions({
    newStackTitle,
    notebooksToAddToStack,
    setLoading,
    setRefetchNotebooksKey,
    setNewStackTitle,
    setNotebooksToAddToStack,
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

    return { handleCreateStack }
}
