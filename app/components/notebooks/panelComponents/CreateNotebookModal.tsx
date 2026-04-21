import { Dispatch, SetStateAction } from "react"

interface CreateNotebookModalProps {
    newNotebookTitle: string
    setNewNotebookTitle: Dispatch<SetStateAction<string>>
    loading: boolean
    onSubmit: (title: string) => void
    onCancel: () => void
}

export function CreateNotebookModal({
    newNotebookTitle,
    setNewNotebookTitle,
    loading,
    onSubmit,
    onCancel
}: CreateNotebookModalProps) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(newNotebookTitle)
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
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
