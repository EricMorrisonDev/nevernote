import type { Notebook } from "@/lib/types/api"
import { Dispatch, SetStateAction } from "react"

type EditState =
    | { kind: "stack"; id: string; value: string }
    | { kind: "notebook"; id: string; value: string }
    | null

type MenuType = 
    | { kind: "stack"; id: string; x: number, y: number }
    | { kind: "notebook"; id: string; x: number, y: number }
    

interface NotebooksMenuProps {
    notebooks: Notebook[] | null,
    setEditState: Dispatch<SetStateAction<EditState | null>>,
    menuState: MenuType,
    onRemoveFromStack: (id: string) => void
}

export function NotebooksMenu({
    notebooks,
    setEditState,
    menuState,
    onRemoveFromStack
}: NotebooksMenuProps) {

    const activeNotebook = notebooks?.find((n) => n.id === menuState.id)
    const isInStack = Boolean(activeNotebook?.stackId)

    return(
        <div className="rounded-md border border-border bg-background p-2 flex flex-col gap-2 items-start">
            <button 
            type="button"
            className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2"
            onClick={() => {
                const notebook = notebooks?.find((n) => n.id === menuState.id)
                setEditState({
                    kind: "notebook",
                    id: menuState.id,
                    value: notebook?.title ?? ""
                })
            }}
            >
                Rename notebook
            </button>
            <button type="button" className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                Delete notebook
            </button>
            {isInStack && (<button
                type="button"
                className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2"
                onClick={() => {
                    onRemoveFromStack(menuState.id)
                }}
            >
                Remove from stack
            </button>)}
            <button type="button" className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                Move to...
            </button>
        </div>
    )
}