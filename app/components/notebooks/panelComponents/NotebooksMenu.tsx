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
    menuState: MenuType
}

export function NotebooksMenu({
    notebooks,
    setEditState,
    menuState
}: NotebooksMenuProps) {

    return(
        <div>
            <button 
            type="button"
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
            <button type="button">
                Delete notebook
            </button>
            <button type="button">
                Remove from stack
            </button>
            <button type="button">
                Move to...
            </button>
        </div>
    )
}