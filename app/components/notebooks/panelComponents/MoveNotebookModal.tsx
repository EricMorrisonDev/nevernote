import type { Notebook, Stack } from "@/lib/types/api"
import type { FormEvent } from "react"
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
                <div
                    className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-background p-1"
                    role="listbox"
                    aria-label="Destination stacks"
                >
                    <ul className="flex flex-col gap-1">
                        {availableStacks.map((stack) => {
                            const isSelected = effectiveSelectedStackId === stack.id
                            return (
                                <li key={stack.id}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        className={`w-full rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors ${
                                            isSelected
                                                ? "border border-accent/50 bg-surface"
                                                : "border border-transparent hover:bg-surface-2"
                                        }`}
                                        onClick={() => {
                                            setSelectedStackId(stack.id)
                                        }}
                                    >
                                        <span className="block truncate">{stack.title}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
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
