import type { Notebook, Stack } from "@/lib/types/api"
import { useMemo, useState } from "react"

interface MoveNotebookModalProps {
    notebook: Notebook | undefined
    stacks: Stack[]
    loading: boolean
    onSubmit: (notebookId: string, targetStackId: string) => void
    onCancel: () => void
}

export function MoveNotebookModal({
    notebook,
    stacks,
    loading,
    onSubmit,
    onCancel,
}: MoveNotebookModalProps) {
    const availableStacks = useMemo(() => {
        return stacks.filter((stack) => stack.id !== notebook?.stackId)
    }, [stacks, notebook?.stackId])

    const [selectedStackId, setSelectedStackId] = useState("")

    const effectiveSelectedStackId =
        selectedStackId || availableStacks[0]?.id || ""

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!notebook?.id || !effectiveSelectedStackId) return
        onSubmit(notebook.id, effectiveSelectedStackId)
    }

    return (
        <form onSubmit={handleSubmit}>
            <h4>
                Move notebook
                {notebook?.title ? `: ${notebook.title}` : ""}
            </h4>
            <p className="my-3 text-sm text-muted">
                Choose a destination stack for this notebook.
            </p>

            {availableStacks.length === 0 ? (
                <p className="rounded-md border border-border bg-background p-3 text-sm text-muted">
                    No destination stacks available.
                </p>
            ) : (
                <select
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none"
                    value={effectiveSelectedStackId}
                    onChange={(e) => {
                        setSelectedStackId(e.target.value)
                    }}
                >
                    {availableStacks.map((stack) => (
                        <option key={stack.id} value={stack.id}>
                            {stack.title}
                        </option>
                    ))}
                </select>
            )}

            <div className="mt-4 flex justify-between">
                <button
                    type="submit"
                    className="w-[110px] rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading || !notebook?.id || !effectiveSelectedStackId}
                >
                    Move
                </button>
                <button
                    type="button"
                    className="w-[110px] rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
