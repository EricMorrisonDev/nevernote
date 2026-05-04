import type { Notebook } from "@/lib/types/api"
import { Dispatch, SetStateAction } from "react"

interface CreateStackModalProps {
    newStackTitle: string
    setNewStackTitle: Dispatch<SetStateAction<string>>
    notebooks: Notebook[] | null
    notebooksToAddToStack: string[]
    setNotebooksToAddToStack: Dispatch<SetStateAction<string[]>>
    loading: boolean
    onSubmit: () => void
    onCancel: () => void
}

export function CreateStackModal({
    newStackTitle,
    setNewStackTitle,
    notebooks,
    notebooksToAddToStack,
    setNotebooksToAddToStack,
    loading,
    onSubmit,
    onCancel
}: CreateStackModalProps) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
        >
            <h4>Name your new stack</h4>
            <input 
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                type="text"
                placeholder="title"
                value={newStackTitle}
                onChange={(e) => {
                    setNewStackTitle(e.target.value)
                }}
            />
            <div className="">
                <p className="my-4">Choose at least one notebook to add to your new stack</p>
                <div className="bg-background p-2 rounded-md">
                    <ul>
                        {notebooks?.filter(
                            notebook => !notebook.stackId
                        ).map(notebook => (
                            <li key={notebook.id}>
                                <label
                                    className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 hover:bg-surface-2/50"
                                >
                                    <input
                                        type="checkbox"
                                        className="size-4 shrink-0 cursor-pointer rounded border border-border bg-background accent-control text-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50"
                                        checked={notebooksToAddToStack.includes(notebook.id)}
                                        onChange={() => {
                                            setNotebooksToAddToStack((prev) => 
                                                prev.includes(notebook.id) ?
                                                prev.filter((id) => id !== notebook.id)
                                                : [...prev, notebook.id]
                                            )
                                        }}
                                    />
                                    <span>
                                        {notebook.title}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    type="submit"
                    className="rounded-lg border border-control-border bg-control-surface px-3 py-2 text-sm font-medium text-control hover:bg-control-surface-hover w-[110px]"
                    disabled={loading}
                    >
                    Create
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                    onClick={() => {
                        setNotebooksToAddToStack([])
                        onCancel()
                    }}
                    >
                        Cancel
                </button>
            </div>
        </form>
    )
}
